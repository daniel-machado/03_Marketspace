import { useCallback, useState } from 'react'
import { Alert, Dimensions } from 'react-native'
import {
  Box, Icon, HStack, Text, Pressable, useTheme, VStack, Heading, ScrollView, Center, useToast, Image
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
import Carousel from 'react-native-reanimated-carousel'

interface RouteParamsProps {
  myProductId: string
}

export function MyProduct() {
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingLoading, setIsDeletingLoading] = useState(false)
  const [isChangingVisibilityLoading, setIsChangingVisibilityLoading] = useState(false);
  const [productAdverts, setProductAdverts] = useState<ProductDTO>({} as ProductDTO);

  const route = useRoute()
  const toast = useToast()
  const { colors } = useTheme();

  const width = Dimensions.get('window').width;

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const { myProductId } = route.params as RouteParamsProps

  const height = Dimensions.get('window').height

  function handleEditMyProduct() {
    navigation.navigate('editAdverts', {
      title: productAdverts.name,
      description: productAdverts.description,
      price: productAdverts.price.toString(),
      images: productAdverts.product_images,
      paymentMethods: productAdverts.payment_methods.map((item) => item.key),
      isNew: productAdverts.is_new,
      acceptTrade: productAdverts.accept_trade,
      id: productAdverts.id,
    });
  }
  
  function handleGoBack() {
    navigation.navigate('app', {screen: 'myAdverts' });
  }
  
  async function fetchGetMyProductById() {
    try {
      setIsLoading(true)
      const { data } = await api.get(`/products/${myProductId}`)
      setProductAdverts(data)
      setIsLoading(false)
    } catch(error) {
      const isAppError = error instanceof AppError
      const title = isAppError 
        ? 
          error.message 
        : 
          'Não foi possível receber os dados do anúncio. Tente Novamente!'

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
      setIsChangingVisibilityLoading(true)
      await api.patch(`/products/${productAdverts.id}`, {
        is_active: !productAdverts.is_active,
      });

      setProductAdverts({ ...productAdverts, is_active: !productAdverts.is_active });
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
        setIsChangingVisibilityLoading(false);
      }
  }

  async function handleDeleteProduct() {
    try {
      setIsDeletingLoading(true)
      await api.delete(`/products/${myProductId}`);
      const title = 'Produto deletado com sucesso!'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
        duration: 3000,
      })
      navigation.navigate('app', { screen: 'myAdverts' })

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
      setIsDeletingLoading(false);
    }
  }

  function handleButtonRemoveAd() {
    Alert.alert('Excluir', 'Deseja excluir o anúncio?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: () => handleDeleteProduct() },
    ])
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
    <>
      {
        isLoading
        ?
        <Loading />
        :
        <ScrollView 
          flex={1} 
          bg='gray.700' 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
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
            {!productAdverts.is_active && (
              <Box
                h='280' w='100%' top='0'
                position='absolute' zIndex={11} backgroundColor='card-stoped'>
                <Heading
                  textTransform="uppercase"
                  color="white"
                  fontSize="lg"
                  textAlign="center"
                  fontFamily="heading"
                >
                  Anúncio Desativado
                </Heading>
              </Box>
            )}
            <Box w={width} h={280} >
              <Carousel
                loop
                width={width}
                autoPlay={productAdverts.product_images.length > 1}
                data={productAdverts.product_images}
                scrollAnimationDuration={2000}
                onSnapToItem={index => index}
                renderItem={({ item, index }) => (  
                  <Image
                    key={index}
                    source={{ uri: `${api.defaults.baseURL}/images/${item.path}` }}
                    h={300}
                    w="100%"
                    alt='images'
                    resizeMode="cover"
                  />
                )}
              />
            </Box>
          </Box>
          

          <Box w='100%' px={6} mt={5}>
            <HStack alignItems='center'>
              <UserPhoto
                source={{ uri: `${api.defaults.baseURL}/images/${productAdverts.user?.avatar}` }}
                alt='Imagem do usuário'
                size={10}
              />

              <Text ml='4' color='gray.100'>
                {productAdverts.user?.name}
              </Text>
            </HStack>

            <VStack mt={6}>
              <Box
                w='43' mb={1} alignItems='center' rounded='2xl' backgroundColor='gray.500'
              >
                <Text color='gray.200' fontSize={10} fontFamily='heading'>
                  {productAdverts.is_new ? 'NOVO' : 'USADO'}
                </Text>
              </Box>

              <HStack alignItems='center' justifyContent='space-between'>
                <Heading>
                  {productAdverts.name}
                </Heading>

                <HStack alignItems='center'>
                  <Text alignItems='flex-end' ml={1} color='blue.500' fontFamily='heading' fontSize={20}>
                    {formatBRL(productAdverts.price)}
                  </Text>
                </HStack>
              </HStack>

              <Text mt={2} color='gray.200'>
                {productAdverts.description}
              </Text>

              <HStack mt={6}>
                <Text color='gray.100' fontFamily='heading'>
                  Aceita troca?
                </Text>

                <Text ml={2} color='gray.200'>
                  {productAdverts.accept_trade ? 'SIM' : 'NÃO'}
                </Text>
              </HStack>

              <VStack mt={1}>
                <Text color='gray.100' fontFamily='heading'>
                  Meio de Pagamento:
                </Text>
              {productAdverts.payment_methods?.map((item) => (
                  <PaymentIcons key={item.key} name={item.name} id={item.key}  />
                ))}
              </VStack>

              <VStack 
                mt={10} mb={10} justifyContent='space-between' alignItems='center'
              >
                <Button 
                  onPress={handleChangeActiveProduct} 
                  title={productAdverts.is_active ? 'Desativar anúncio' : 'Ativar anúncio'}
                  backgroundColor={productAdverts.is_active ? 'gray.100' : 'blue.500'}
                  mb={2}
                  leftIcon={
                    <Icon 
                      as={AntDesign} name='poweroff'
                      size={4} color='gray.700'
                    />
                  }
                />

                <Button 
                  isLoading={isDeletingLoading}
                  onPress={handleButtonRemoveAd} 
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
      }
    </>
  )
}
