import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import {
  ScrollView,
  Text,
  VStack,
  HStack,
  Image,
  Heading,
  useToast,
  Box,
} from 'native-base'

import { useNavigation, useRoute } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Button } from '@components/Button'

import { ArrowLeft, Tag } from 'phosphor-react-native'
import { GeneratePaymentMethods } from '@utils/generatePaymentMethods'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ImagePreviewCarousel } from '@components/ImagePreviewCarousel'

type RouteParams = {
  title: string
  description: string
  price: string
  images: any[]
  paymentMethods: string[]
  isNew: boolean
  acceptTrade: boolean
  id: string
}

export function PreviewEditAdverts(){
  const [isLoading, setIsLoading] = useState(false)
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const { user } = useAuth()

  const toast = useToast()

  const route = useRoute()
  const {
    title,
    description,
    price,
    images,
    paymentMethods,
    isNew,
    acceptTrade,
    id,
  } = route.params as RouteParams

  const handleGoBack = () => {
    navigation.goBack()
  }

  const handlePublish = async () => {
    setIsLoading(true)

    try {
      const product = await api.get(`products/${id}`)

      await api.put(`/products/${id}`, {
        name: title,
        description,
        price: parseInt(price.replace(/[^0-9]/g, '')),
        payment_methods: paymentMethods,
        is_new: isNew,
        accept_trade: acceptTrade,
      })

      images.forEach(async (item) => {
        // eslint-disable-next-line no-empty
        if (item.path) {
        } else if (item.uri) {
          const imageData = new FormData()

          const imageFile = {
            ...item,
            name: user.name + '.' + item.name,
          } as any

          imageData.append('images', imageFile)

          imageData.append('product_id', product.data.id)

          await api.post('/products/images', imageData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
        }
      })
      navigation.navigate('myProduct', { id })
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não publicar o anúncio. Tente novamente mais tarde!'

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

  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack flex={1}>
          <VStack
            w="full"
            justifyContent="space-between"
            pt={12}
            pb={5}
            alignItems="center"
            bg="blue.light"
          >
            <Heading color="white" fontFamily="heading" fontSize={20}>
              Pré visualização do anúncio
            </Heading>
            <Text color="white" fontSize={14}>
              É assim que seu produto vai aparecer!
            </Text>
          </VStack>

          <ImagePreviewCarousel
            images={images}
          />
         
          <VStack px={5}>
            <HStack mb={6} mt={4} alignItems="center">
              <Image
                h={8}
                w={8}
                source={{
                  uri: `${api.defaults.baseURL}/images/${user?.avatar}`,
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
                {user.name}
              </Heading>
            </HStack>
            <Box
              w={55}
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
                {isNew ? 'Novo' : 'Usado'}
              </Heading>
            </Box>
            <HStack w="full" justifyContent="space-between" alignItems="center">
              <Heading color="gray.200" fontSize={22} fontFamily="heading">
                {title}
              </Heading>
              <Text color="blue.light" fontFamily="heading">
                <Heading color="blue.light" fontFamily="heading" fontSize={20}>
                  R$ {price}
                </Heading>
              </Text>
            </HStack>

            <Text mt={2} color="gray.300">
              {description}
            </Text>

            <Heading color="gray.300" fontSize={14} my={5}>
              Aceita troca?{' '}
              <Text fontWeight="normal">{acceptTrade ? 'Sim' : 'Não'}</Text>
            </Heading>

            <Heading color="gray.300" fontSize={14} mb={2}>
              Meios de Pagamento:
            </Heading>

            {GeneratePaymentMethods(paymentMethods)}
          </VStack>
        </VStack>
      </ScrollView>
      <Box h={100} bg="white">
        <HStack
          py={2}
          px={5}
          alignItems="center"
          justifyContent="space-between"
        >
          <Button
            variant="secondary"
            title="Voltar e editar"
            alignItems="center"
            justifyContent="center"
            w="47%"
            h={12}
            mt={2}
            leftIcon={
              <ArrowLeft color="gray" size={18} />
            }
            onPress={handleGoBack}
          />
          <Button
            title="Publicar"
            alignItems="center"
            justifyContent="center"
            w="47%"
            isLoading={isLoading}
            h={12}
            mt={2}
            leftIcon={
              <Tag color="white" size={18} />
            }
            onPress={handlePublish}
          />
        </HStack>
      </Box>
    </>
  )
}
