/* eslint-disable camelcase */
import { useState, useEffect } from 'react'
import {
  ScrollView,
  Text,
  VStack,
  HStack,
  Button as NativeButton,
  Image,
  Heading,
  useTheme,
  useToast,
  Box,
} from 'native-base'

import { Dimensions } from 'react-native'

import { useNavigation, useRoute } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Button } from '@components/Button'

import { AppError } from '@utils/AppError'
import { api } from '@services/api'

import { ArrowLeft, WhatsappLogo } from 'phosphor-react-native'

import { ProductDTO } from '../dtos/ProductDTO'
import { Loading } from '@components/Loading'
import { GeneratePaymentMethods } from '@utils/generatePaymentMethods'
import { ImagePreviewCarousel } from '@components/ImagePreviewCarousel'

type RouteParams = {
  id: string
}

export function Adverts() {
  const [isLoading, setIsLoading] = useState(true)
  const [product, setProduct] = useState({} as ProductDTO)

  const { colors } = useTheme()

  const route = useRoute()
  const toast = useToast()

  const { id } = route.params as RouteParams

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const handleGoBack = () => {
    navigation.navigate('app', { screen: 'home' })
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const productData = await api.get(`products/${id}`)
        setProduct(productData.data)
        setIsLoading(false)
      } catch (error) {
        const isAppError = error instanceof AppError
        const title = isAppError
          ? error.message
          : 'Não foi possível receber os dados do anúncio. Tente Novamente!'

        if (isAppError) {
          toast.show({
            title,
            placement: 'top',
            bgColor: 'red.500',
          })
        }
      }
    }

    loadData()
  }, [])

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <VStack flex={1}>
              <HStack w="full" justifyContent="space-between" mt={10}>
                <NativeButton variant="secondary" px={5} onPress={handleGoBack}>
                  <ArrowLeft color={colors.gray[200]} />
                </NativeButton>
              </HStack>

              <Box
                position="relative"
                alignItems="center"
                justifyContent="center"
              >
                {!product.is_active && (
                  <Heading
                    flex={1}
                    textTransform="uppercase"
                    color="white"
                    fontSize="lg"
                    position="absolute"
                    zIndex={100}
                    bg="gray.300"
                    p={1}
                    w={240}
                    textAlign="center"
                    borderRadius={10}
                  >
                    Anúncio Desativado
                  </Heading>
                )}
                <ImagePreviewCarousel
                  images={product.product_images}  
                />
              </Box>

              <VStack px={5}>
                <HStack mb={6} mt={4} alignItems="center">
                  <Image
                    h={8}
                    w={8}
                    source={{
                      uri: `${api.defaults.baseURL}/images/${product.user?.avatar}`,
                    }}
                    alt="user image"
                    borderRadius="full"
                    borderWidth={2}
                    borderColor="blue.light"
                  />
                  <Heading
                    color="gray.100"
                    fontSize={16}
                    ml={2}
                    textTransform="capitalize"
                  >
                    {product.user?.name}
                  </Heading>
                </HStack>
                <Box
                  w={50}
                  h={5}
                  mb={2}
                  bg="gray.500"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius={9999}
                >
                  <Heading
                    textTransform="uppercase"
                    color="gray.100"
                    fontSize={12}
                    fontFamily="heading"
                  >
                    {product.is_new ? 'NOVO' : 'USADO'}
                  </Heading>
                </Box>

                <HStack
                  w="full"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Heading color="gray.200" fontSize={22} fontFamily="heading">
                    {product.name}
                  </Heading>
                  <Text color="blue.light" fontFamily="heading">
                    R${' '}
                    <Heading
                      color="blue.light"
                      fontFamily="heading"
                      fontSize={20}
                    >
                      {product.price}
                    </Heading>
                  </Text>
                </HStack>

                <Text mt={2} color="gray.300">
                  {product.description}
                </Text>

                <Heading
                  color="gray.300"
                  fontSize={14}
                  my={5}
                  fontFamily="heading"
                >
                  Aceita troca?{' '}
                  <Text fontWeight="normal" fontFamily="body">
                    {product.accept_trade ? 'Sim' : 'Não'}
                  </Text>
                </Heading>

                <Heading
                  color="gray.300"
                  fontSize={14}
                  mb={2}
                  fontFamily="heading"
                >
                  Meios de Pagamento:
                </Heading>

                {GeneratePaymentMethods(
                  product.payment_methods.map(
                    (payment_method) => payment_method.key,
                  ),
                )}
              </VStack>
            </VStack>
          </ScrollView>
          <HStack
            w="full"
            p={5}
            bg="white"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text color="blue.light" fontFamily="heading">
              R${' '}
              <Heading color="blue.light" fontFamily="heading" fontSize={24}>
                {product.price}
              </Heading>
            </Text>

            <Button
              title="Entrar em contato"
              alignItems="center"
              justifyContent="center"
              w="50%"
              leftIcon={  
                <WhatsappLogo 
                  color="white" 
                  weight="fill" 
                  size={20} 
                />
              }
            />
          </HStack>
        </>
      )}
    </>
  )
}