import { useCallback, useState } from 'react'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { MaterialIcons, AntDesign, FontAwesome } from '@expo/vector-icons'
import { 
  Box, 
  Icon, 
  HStack, 
  Text, 
  VStack, 
  Heading, 
  ScrollView, 
  Center, 
  Pressable,
  useToast
} from 'native-base'

import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'
import { AppError } from '@utils/AppError'
import { formatBRL } from '@utils/formatBRL'
import { NewProductDTO } from '@dtos/NewProductDTO'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Button } from '@components/Button'
import { UserPhoto } from '@components/UserPhoto'
import { PaymentIcons } from '@components/PaymentsIcons'
import { ImagePreviewCarousel } from '@components/ImagePreviewCarousel'

interface RouteParams {
  product: string
}

export function DetailsProduct() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const route = useRoute()
  const toast = useToast()
  
  const { user } = useAuth()
  const { product } = route.params as RouteParams
  
  const [isLoadingButton, setIsLoadingButton] = useState(false)
  const [productData, setProductData] = useState<NewProductDTO>({} as NewProductDTO)

  function handleGoBackToAd() {
    navigation.navigate('myAdverts')
  }

  function handleEditMyAdverts() {
    //navigation.navigate('editMyAdverts', { productId: product.id! })
  }

  function loadProductData() {
    setProductData(JSON.parse(product))
  }

  useFocusEffect(
    useCallback(() => {
      loadProductData()
    }, [ product ])
  )

  return (
      <ScrollView bg='gray.700'>
        <Box safeArea mt={5} mb={4} px={6}>
          <HStack justifyContent='space-between'>
          
            <Pressable onPress={handleGoBackToAd}>
              <Icon 
                as={MaterialIcons}
                name='arrow-back'
                size={6}
              />
            </Pressable>

            <Pressable onPress={handleEditMyAdverts}>
                <Icon 
                  as={AntDesign}
                  name='edit'
                  size={6}
                />
            </Pressable>
          </HStack>
        </Box>
        
      <ImagePreviewCarousel
        images={productData.product_images}
      />

        <Box w='100%' px={6} mt={5}>
          <HStack alignItems='center'>
            <UserPhoto
              source={{uri: `${api.defaults.baseURL}/images/${productData.user?.avatar}`}}
              alt='Imagem do usuário'
              size={10}
            />

            <Text ml='4' color='gray.100'>
              {productData.user?.name}
            </Text>
          </HStack>

          <VStack mt={5}>
            <Box
              w='55' mb={1} alignItems='center'
              rounded='2xl' backgroundColor='gray.500'
            >
              <Text color='gray.200' fontSize='xs' fontFamily='heading'>
                {productData.is_new ? 'NOVO': 'USADO'}
              </Text>
            </Box>

            <HStack alignItems='center' justifyContent='space-between'>
              <Heading w={200} numberOfLines={1}>
                {productData.name}
              </Heading>

              <HStack alignItems='center'>
                <Text 
                  alignItems='flex-end' ml={1} color='blue.500' fontFamily='heading' fontSize={20}
                >
                  {formatBRL(productData.price)}
                </Text>
              </HStack>
            </HStack>

            <Text mt={2} color='gray.200'>
              {productData.description}
            </Text>

            <HStack mt={5}>
              <Text color='gray.100' fontFamily='heading'>
                Aceita troca?
              </Text>

              <Text ml={2} color='gray.200'>
                {productData.accept_trade ? 'Sim' : 'Não'}
              </Text>
            </HStack>

            <VStack mt={3}>
              <Text color='gray.100' fontFamily='heading'>
                Meio de Pagamento:
              </Text>

              {productData.payment_methods?.map((item) => (
                <PaymentIcons key={item} name={item} id={item} />
              ))}
            </VStack>

            
            <VStack mt={10} mb={10} justifyContent='space-between' alignItems='center'>
              <Button 
                onPress={() => {}} 
                title='Desativar anúncio'
                variant='terceary'
                mb={2}
                leftIcon={
                  <Icon 
                    as={AntDesign}
                    name='poweroff'
                    size={4}
                    color='gray.700'
                  />
                }
              />

              <Button 
                onPress={() => {}} 
                title='Excluir anúncio'
                variant='secondary'
                leftIcon={
                  <Icon 
                    as={AntDesign}
                    name='delete'
                    size={4}
                    color='gray.200'
                  />
                }
              />
            </VStack>

          </VStack>
        </Box>
      </ScrollView>
  )
}
