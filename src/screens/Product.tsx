import { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons'
import { Box, Icon, Image, HStack, Text, Pressable, VStack, Heading, ScrollView, useToast } from 'native-base'

import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { ProductDTO } from '@dtos/ProductDTO'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Button } from '@components/Button'
import { Loading } from '@components/Loading'
import { UserPhoto } from '@components/UserPhoto'
import { ImageCarousel } from '@components/ImageCarousel'
import { PaymentIcons } from '@components/PaymentsIcons'

interface RouteParams {
  productId: string
}

export function Product() {
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState<ProductDTO>({} as ProductDTO)
  
  const route = useRoute()
  const toast = useToast();

  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const { productId } = route.params as RouteParams

  function handleBackToHome() {
    navigation.navigate('home')
  }

  async function fetchProductById() {
    try {
      setIsLoading(true)
      const { data } = await api.get(`/products/${productId}`)
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

  useEffect(() => {
    fetchProductById()
  }, [productId])

  if(isLoading) {
    return <Loading />
  }

  return (
    <ScrollView backgroundColor='gray.700'>
      <Pressable onPress={handleBackToHome}>
        <Icon 
          as={MaterialIcons}
          name='arrow-back'
          size={6}
          color='gray.100'
          mt={10}
          ml={6}
          mb={3}
        />
      </Pressable>
      
      <ImageCarousel images={product.product_images} />

      <Box w='100%' px={6} mt={5}>
        <HStack alignItems='center'>
          <UserPhoto
            source={{ uri: 'https://github.com/jromarioss.png' }}
            alt='Imagem do usuário'
            size={10}
          />

          <Text ml='4' color='gray.100'>
            José Santos
          </Text>
        </HStack>

        <VStack mt={6}>
          <Box
            w='43'
            mb={1}
            alignItems='center'
            rounded='2xl'
            backgroundColor='gray.500'
          >
            <Text color='gray.200' fontSize={10} fontFamily='heading'>
              NOVO
            </Text>
          </Box>

          <HStack alignItems='center' justifyContent='space-between'>
            <Heading>
              {product.name}
            </Heading>

            <HStack alignItems='center'>
              <Text color='blue.500' fontFamily='heading' mt={1}>
                R$
              </Text>
              <Text alignItems='flex-end' ml={1} color='blue.500' fontFamily='heading' fontSize={20}>
                {product.price}
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
              {product.accept_trade}
            </Text>
          </HStack>

          <VStack mt={1}>
            <Text color='gray.100' fontFamily='heading'>
              Meio de Pagamento:
            </Text>
            
            {product.payment_methods.map((item) => (
              <PaymentIcons key={item.key} id={item.key} name={item.name} />
            ))}
          </VStack>

          <HStack alignItems='center' justifyContent='space-between' mt={46} mb={8}>
            <HStack alignItems='center' >
              <Text color='blue.500' fontFamily='heading' mt={1} fontSize={16}>
                R$
              </Text>
              <Text alignItems='flex-end' ml={1} color='blue.500' fontFamily='heading' fontSize={24}>
                {product.price}
              </Text>
            </HStack>

            <Button  title='Entrar em contato' w={170} leftIcon={
                <Icon 
                  as={MaterialIcons}
                  name='phone'
                />
              } 
            />
          </HStack>
        </VStack>
      </Box>
    </ScrollView>
  )
}