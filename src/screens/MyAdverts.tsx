import { useState, useCallback } from 'react'

import {
  Text,
  VStack,
  HStack,
  Heading,
  Button,
  Select,
  useTheme,
  useToast,
  Center,
  FlatList,
} from 'native-base'

import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Card } from '@components/Card'
import { Loading } from '@components/Loading'

import { Plus } from 'phosphor-react-native'

import { ProductDTO } from '@dtos/ProductDTO'

import { AppError } from '@utils/AppError'
import { api } from '@services/api'


export function MyAdverts() {
  const [isLoading, setIsLoading] = useState(true)
  const [productsAdvert, setProductsAdvert] = useState<ProductDTO[]>([]);
  const [advertsType, setAdvertsType] = useState('all')

  const navigation = useNavigation<AppNavigatorRoutesProps>()
  const toast = useToast()
  const { colors } = useTheme()

  const filter = advertsType === 'active'

  const productsFiltered = productsAdvert.filter((product) => {
    if (advertsType === 'all') {
      return true
    }

    return product.is_active === filter
  })

  function handleGoCreateAd() {
    navigation.navigate('createAdverts')
  }

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const productsData = await api.get(`/users/products`)

          setProductsAdvert(productsData.data)
        } catch (error) {
          const isAppError = error instanceof AppError
          const title = isAppError
            ? error.message
            : 'Não foi possível receber seus anúncios. Tente Novamente!'

          if (isAppError) {
            toast.show({
              title,
              placement: 'top',
              bgColor: 'red.500',
            })
          }
        } finally {
          setIsLoading(false)
        }
      }

      loadData()
    }, []),
  )

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <VStack mt={5} pt={5}>
            <Center mt={5} width="full" position="relative" px={5} >
              <Heading color="gray.200" fontSize={22} fontFamily="heading">
                Meus Anúncios
              </Heading>

              <Button
                variant="secondary"
                position="absolute"
                right={0}
                pr={5}
                onPress={handleGoCreateAd}
              >
                <Plus />
              </Button>
            </Center>

            <HStack
              w="full"
              justifyContent="space-between"
              my={7}
              alignItems="center"
              px={5}
            >
              <Text color="gray.300" fontSize={16}>
                {productsAdvert.length} anúncios
              </Text>
              <Select
                selectedValue={advertsType}
                placeholder="Escolha um tipo"
                minWidth="110"
                color="gray.300"
                onValueChange={(itemValue) => setAdvertsType(itemValue)}
                _selectedItem={{
                  borderColor: 'blue.light',
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                <Select.Item label="Todos" value="all" />
                <Select.Item label="Ativos" value="active" />
                <Select.Item label="Inativos" value="inactive" />
              </Select>
            </HStack>
          </VStack>

          <FlatList
            flex={1}
            px={5}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            numColumns={2}
            data={productsFiltered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card
                width={165}
                title={item.name}
                image={`${api.defaults.baseURL}/images/${item.product_images[0].path}`}
                active={item.is_active}
                used={!item.is_new}
                price={item.price.toString()}
                id={item.id}
                showProfile
                profileImage={`${api.defaults.baseURL}/images/${item.user?.avatar}`}
              />

            )}
            ListEmptyComponent={() => (
              <Center flex={1}>
                {advertsType === 'all' && (
                  <Text color="gray.300" textAlign="center">
                    Você ainda não criou nenhum anúncio. {'\n'}
                    Clique em + para criar seu primeiro!
                  </Text>
                )}
                {advertsType === 'active' && (
                  <Text color="gray.300" textAlign="center">
                    Você não tem nenhum produto ativo!
                  </Text>
                )}
                {advertsType === 'inactive' && (
                  <Text color="gray.300" textAlign="center">
                    Você não tem nenhum produto inativo!
                  </Text>
                )}
              </Center>
            )}
          />
        </>
      )}
    </>
  )
}