import { useCallback, useState } from 'react'
import { Dimensions } from 'react-native'
import {
  Box, Icon, HStack, Text, Pressable, VStack, Heading, ScrollView, Center, useToast
} from 'native-base'

import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { MaterialIcons, AntDesign } from '@expo/vector-icons'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { formatBRL } from '@utils/formatBRL'
import { ProductDTO } from '@dtos/ProductDTO'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Button } from '@components/Button'
import { Loading } from '@components/Loading'
import { UserPhoto } from '@components/UserPhoto'
import { PaymentIcons } from '@components/PaymentsIcons'
import { ImageCarousel } from '@components/ImageCarousel'

interface RouteParamsProps {
  myProductId: string
}

export function MyProduct() {
  const route = useRoute()
  const toast = useToast()

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const { myProductId } = route.params as RouteParamsProps

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [product, setProduct] = useState<ProductDTO>({} as ProductDTO)

  const height = Dimensions.get('window').height

  function handleEditMyProduct() {
    navigation.navigate('editMyAdverts', { productId: product.id! })
  }
  
  function handleGoBack() {
    navigation.navigate('myAdverts')
  }
  
  async function fetchGetMyProductById() {
    try {
      setIsLoading(true)
      const { data } = await api.get(`/products/${myProductId}`)
      setProduct(data)
    } catch(error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar a lista'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleChangeActiveProduct() {
    try {
      await api.patch(`/products/${product.id}`, {
        is_active: !product.is_active,
      });

      setProduct({ ...product, is_active: !product.is_active });
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar a lista'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
        duration: 3000,
      })
    }
  }

  async function handleDeleteProduct() {
    try {
      setIsLoadingButton(true)
      await api.delete(`/products/${myProductId}`);
      
      const title = 'Produto deletado com sucesso!'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
        duration: 3000,
      })

      navigation.navigate('myAdverts');
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar a lista'

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
        duration: 3000,
      })
    } finally {
      setIsLoadingButton(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchGetMyProductById()
    }, [myProductId])
  )

  if(isLoading) {
    return (
      <Box h={height} alignItems='center' justifyContent='center'>
        <Loading />
      </Box>
    )
  }

  return (
    <ScrollView flex={1} backgroundColor='gray.700'>
      <Center safeArea mt={3}>
        <Box mb={4} px={6} w='100%'>
          <HStack justifyContent='space-between'>
            <Pressable onPress={handleGoBack}>
              <Icon 
                as={MaterialIcons} name='arrow-back' size={6}
              />
            </Pressable>

            <Pressable onPress={handleEditMyProduct}>
                <Icon 
                  as={AntDesign} name='edit' size={6}
                />
            </Pressable>
          </HStack>
        </Box>

        <Box>
          <ImageCarousel images={product.product_images} />

          {!product.is_active && (
            <Box
              h='280' w='100%' top='0'
              position='absolute' zIndex={11} backgroundColor='card-stoped'>
              <Text color='gray.700' fontSize={14} fontFamily='heading' textAlign='center' mt={130} >
                ANÚNCIO DESATIVADO
              </Text>
            </Box>
          )}
        </Box>
        

        <Box w='100%' px={6} mt={5}>
          <HStack alignItems='center'>
            <UserPhoto
              source={{ uri: `${api.defaults.baseURL}/images/${product.user?.avatar}` }}
              alt='Imagem do usuário'
              size={10}
            />

            <Text ml='4' color='gray.100'>
              {product.user?.name}
            </Text>
          </HStack>

          <VStack mt={6}>
            <Box
              w='43' mb={1} alignItems='center' rounded='2xl' backgroundColor='gray.500'
            >
              <Text color='gray.200' fontSize={10} fontFamily='heading'>
                {product.is_new ? 'NOVO' : 'USADO'}
              </Text>
            </Box>

            <HStack alignItems='center' justifyContent='space-between'>
              <Heading>
                {product.name}
              </Heading>

              <HStack alignItems='center'>
                <Text alignItems='flex-end' ml={1} color='blue.500' fontFamily='heading' fontSize={20}>
                  {formatBRL(product.price)}
                </Text>
              </HStack>
            </HStack>

            <Text mt={2} color='gray.200'>
              {product.description}
            </Text>

            <HStack mt={6}>
              <Text color='gray.100' fontFamily='heading'>
                Aceita troca?
              </Text>

              <Text ml={2} color='gray.200'>
                {product.accept_trade ? 'SIM' : 'NÃO'}
              </Text>
            </HStack>

            <VStack mt={1}>
              <Text color='gray.100' fontFamily='heading'>
                Meio de Pagamento:
              </Text>
             {product.payment_methods?.map((item) => (
                <PaymentIcons key={item.key} name={item.name} id={item.key}  />
              ))}
            </VStack>

            <VStack 
              mt={10} mb={10} justifyContent='space-between' alignItems='center'
            >
              <Button 
                onPress={handleChangeActiveProduct} 
                title={product.is_active ? 'Desativar anúncio' : 'Ativar anúncio'}
                backgroundColor={product.is_active ? 'gray.100' : 'blue.500'}
                mb={2}
                leftIcon={
                  <Icon 
                    as={AntDesign} name='poweroff'
                    size={4} color='gray.700'
                  />
                }
              />

              <Button 
                isLoading={isLoadingButton}
                onPress={handleDeleteProduct} 
                title='Excluir anúncio' variant='secondary'
                leftIcon={
                  <Icon 
                    as={AntDesign} name='delete'
                    size={4} color='gray.200'
                  />
                }
              />
            </VStack>
          </VStack>
        </Box>
      </Center>
    </ScrollView>
  )
}
