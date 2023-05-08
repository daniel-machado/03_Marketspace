import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import Modal from "react-native-modal";
import {VStack,  
        Text, 
        Center, 
        Box,
        Pressable,
        useTheme, 
        useToast,
        ScrollView,
        HStack,
        Switch,
        Checkbox,
        FlatList
      } from 'native-base';

import { api } from '@services/api'

import { Controller, useForm } from 'react-hook-form'

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useAuth } from '@hooks/useAuth'

import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

import { Input } from '@components/Input';
import { HomeHeader } from '@components/HomeHeader';
import { Loading } from '@components/Loading';
import { Card } from '@components/Card';
import { FilterButton } from '@components/FilterButton';
import { Button } from '@components/Button';

import { AppNavigatorRoutesProps } from '@routes/app.routes';

import { ProductDTO } from '@dtos/ProductDTO';

import { AppError } from '@utils/AppError';

type FormDataProps = {
  search: string
}

const signInSchema = yup.object({
  search: yup.string(),
})

function Home(){
  const { sizes, colors } = useTheme();

  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState<boolean | undefined>(undefined);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([
    'pix', 'boleto', 'cash', 'deposit', 'card',
  ]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  const [acceptTrade, setAcceptTrade] = useState<boolean>(false); 
  const [productActiveCount, setProductActiveCount] = useState(0);
  const [productsAdvert, setProductsAdvert] = useState<ProductDTO[]>([]);
  const [nameOfProduct, setNameOfProduct] = useState('')

  const [selectNew, setSelectNew] = useState(false)
  const [selectOld, setSelectOld] = useState(false)

  const toast = useToast();
  const { user } = useAuth()
  const navigation = useNavigation<AppNavigatorRoutesProps>();


  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      search: '',
    },
    resolver: yupResolver(signInSchema),
  })

/*
  async function fetchListAllProduct(){
    setIsLoadingProduct(true);
    try{
      const { data } = await api.get('/products', {
        params: {
          query: nameOfProduct || undefined,
          is_new: isNew,
          accept_trade: acceptTrade || undefined,
          payment_methods: paymentMethods
        }
      })
      setProductsAdvert(data);
    } catch (error){
      const isAppError = error instanceof AppError
      const  title = isAppError ? error.message : 'Não foi possível carregar lista'
      
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
        duration: 3000,
      })
    } finally {
      setIsLoadingProduct(false);
    }
  }
*/

  async function fetchListAllProduct(){
  setIsLoading(true);
  try{
    const { data } = await api.get('/products');
    setProductsAdvert(data);
  } catch (error){
    const isAppError = error instanceof AppError
    const  title = isAppError ? error.message : 'Não foi possível carregar lista'
    
    toast.show({
      title,
      placement: 'top',
      bgColor: 'red.500',
      duration: 3000,
    })
  } finally {
    setIsLoading(false);
  }
  }

  async function fetchUserProduct(){
    setIsLoading(true);
    try{
      const { data } = await api.get('users/products');
      const amounts = data.filter((amount: ProductDTO) => amount.is_active)
      setProductActiveCount(amounts.length);
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível receber os produtos. Tente Novamente!'

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        })
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleGoToAnnouncement(){
    navigation.navigate('app', { screen: 'myAdverts'});
  }

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  const handleApplyFilters = async ({ search }: FormDataProps) => {
    setShowModal(false);
    try {
      let paymentMethodsQuery = ''

      paymentMethods.forEach((item) => {
        paymentMethodsQuery = paymentMethodsQuery + `&payment_methods=${item}`
      })

      setIsLoadingProduct(true);
      const productsData = await api.get(
        `/products/?is_new=${isNew}&accept_trade=${acceptTrade}${paymentMethodsQuery}${
          search.length > 0 && `&query=${search}`
        }`,
      )
      setProductsAdvert(productsData.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível receber os produtos. Tente Novamente!'

      if (isAppError) {
        toast.show({
          title,
          placement: 'top',
          bgColor: 'red.500',
        })
      }
    } finally {
      setIsLoadingProduct(false);
    }
  }

  function handleSelectNew(){
    setSelectNew(true)
    setSelectOld(false)
    setIsNew(true)
  }
  function handleSelectOld() {
    setSelectOld(true)
    setSelectNew(false)
    setIsNew(false)
  }

  function handleResetFilter() {
    setAcceptTrade(false)
    setIsNew(true)
    setSelectOld(false)
    setSelectNew(false)
    setPaymentMethods([])
  }

  useFocusEffect(
    useCallback(() => {
      fetchUserProduct()
      fetchListAllProduct()
    }, [])
  )

  return (
    <>
      {
        isLoading 
        ? <Loading />
        :
          <ScrollView flex={1} bg='gray.700'>
            <Center safeArea mt={3}>
              <Box w='100%' px={5}>
        
                <Center>
                  <HomeHeader />
                </Center>

                <Box my={6}>
                  <Text 
                    fontSize='sm'
                    fontFamily='body'
                    color='gray.300'
                  >
                    Seus produtos anunciados para venda
                  </Text>

                <HStack 
                  mt={3} 
                  h={75} 
                  rounded='lg' 
                  bg='rgba(100, 122, 199, 0.1)' 
                  w="100%" 
                  justifyContent="space-between" 
                  alignItems='center' 
                  p={5} 
                >
                  <HStack alignItems='center' >
                    <AntDesign 
                      name="tago" 
                      size={28} 
                      color={colors.blue[700]} 
                    />
                    <VStack ml={3}>
                      <Text 
                        fontFamily='heading' 
                        fontSize="xl"
                        color='gray.200'
                      >
                        { productActiveCount === 0 ? '0' : productActiveCount }
                      </Text>
                      <Text 
                        fontFamily='body' 
                        fontSize="xs"
                        color='gray.200'
                      >
                        { productActiveCount <= 1 ? 'anúncio ativo' : 'anúncios ativos' }
                      </Text>
                    </VStack>
                  </HStack>
                  <Pressable onPress={handleGoToAnnouncement}>
                    <HStack alignItems='center'>
                      <Text
                        fontFamily='heading'
                        color='blue.700'
                        mr={3}
                      >
                        Meus anúncios
                      </Text>
                      <AntDesign name="arrowright" size={20} color={colors.blue[700]} />
                    </HStack> 
                  </Pressable>
                </HStack>
              </Box>
          <VStack>
          <Text
            fontFamily='body'
            fontSize='sm'
            color='gray.300'
            mb={3}
          >
            Compre produtos variados
          </Text>

          <Controller
            control={control}
            name="search"
            rules={{ required: 'Informe o nome do produto' }}
            render={({ field: { onChange, value } }) => (
              <>
                <Input
                  InputRightElement={
                    <HStack mr={5} >
                      <Pressable
                        onPress={handleSubmit(handleApplyFilters)}
                        mr={3}
                      >
                        <AntDesign  name="search1" size={24} color={colors.gray[200]} />
                      </Pressable>  
                      <Box borderLeftWidth={1} borderLeftColor='gray.400'></Box>  
                      <Pressable
                        onPress={handleToggleModal}
                        pl={3}
                      >
                        <Feather name="sliders" size={24} color={colors.gray[200]} />
                      </Pressable>
                    </HStack>
                  }
                  alignItems='center' mb={4}
                  placeholder='Buscar anúncio'
                  value={value}
                  onChangeText={onChange}
                />  
                {errors.search?.message && (
                  <Text
                    position="absolute"
                    top="-20"
                    right="4"
                    color="red.light"
                  >
                    {errors.search?.message}
                  </Text>
                )}
              </>
            )}
          />
        </VStack>
        
        {
          isLoadingProduct
          ?
            <Center flex={1} mt={150}>
              <Loading />
            </Center> 
          :
            <FlatList
              flex={1}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              numColumns={2}
              data={productsAdvert}
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
                <Center>
                  {isNew && !acceptTrade && paymentMethods.length === 5 ? (
                    <Text color="gray.300" textAlign="center">
                      Parece que nenhum produto foi anunciado ainda!
                    </Text>
                  ) : (
                    <Text color="gray.300" textAlign="center">
                      Parece que nenhum produto com esses filtros foi anunciado
                      acima!
                    </Text>
                  )}
                </Center>
              )}
            />
        }
      <Modal
      onBackdropPress={() => setShowModal(false)}
      onBackButtonPress={() => setShowModal(false)}
      isVisible={showModal}
      swipeDirection="down"
      onSwipeComplete={handleToggleModal}
      animationIn="bounceInUp"
      animationOut="bounceOutDown"
      animationInTiming={2000}
      animationOutTiming={1000}
      backdropTransitionInTiming={1500}
      backdropTransitionOutTiming={700}
      style={{ justifyContent: 'flex-end', margin: 0}}
    >
      <Box 
        bg='gray.700' 
        pt={3} 
        px={7} 
        pb={10}
        minH={400}
        borderTopRightRadius={20}
        borderTopLeftRadius={20}
      >
        <Box>
          <Center>
          <Box  w={20} h={1} bg='gray.400' mb={5} borderRadius={5}/>
          </Center>
          
          <Text fontFamily='heading' fontSize={20} mb={5}>Filtrar anúncios</Text>
          <Text fontFamily='heading' color='gray.200'>Condição</Text>

          <HStack>
            <FilterButton onPress={handleSelectNew} selected={selectNew} title='NOVO' />
            <FilterButton onPress={handleSelectOld} selected={selectOld} title='USADO' />
          </HStack>

          <Text fontFamily='heading' color='gray.200' mt={4}>Aceita Troca?</Text>
            <HStack>
              <Switch 
                size='lg' offTrackColor='gray.500' onTrackColor='blue.light'
                onThumbColor='gray.500' offThumbColor='gray.500'
                value={acceptTrade}
                onValueChange={(e) => setAcceptTrade(e)}
              />
            </HStack>

          <Text fontFamily='heading' color='gray.200' mb={3}>
            Meios de pagamento aceitos
          </Text>

          <Checkbox.Group
            onChange={setPaymentMethods} 
            value={paymentMethods} 
            defaultValue={paymentMethods}
          >
            <Checkbox 
              value='boleto' mb={2} 
              _checked={{
                bg: 'blue.',
                borderColor: 'blue.light'
              }}
              _pressed={{
                bg: 'blue.light',
                borderColor: 'blue.light'
              }}
            >
              Boleto
            </Checkbox>

            <Checkbox 
              value='pix' mb={2}
              _checked={{
                bg: 'blue.light',
                borderColor: 'blue.light'
              }}
              _pressed={{
                bg: 'blue.light',
                borderColor: 'blue.light'
              }}
            >
              Pix
            </Checkbox>

            <Checkbox 
              value='dinheiro' mb={2}
              _checked={{
                bg: 'blue.light',
                borderColor: 'blue.light',
              }}
              _pressed={{
                bg: 'blue.light',
                borderColor: 'blue.light',
              }}
            >
              Dinheiro
            </Checkbox>

            <Checkbox 
              value='credito' mb={2}
              _checked={{
                bg: 'blue.light',
                borderColor: 'blue.light',
              }}
              _pressed={{
                bg: 'blue.light',
                borderColor: 'blue.light',
              }}
            >
              Cartão de Crédito
            </Checkbox>

            <Checkbox 
              value='deposito'
              _checked={{
                bg: 'blue.light',
                borderColor: 'blue.light',
              }}
              _pressed={{
                bg: 'blue.light',
                borderColor: 'blue.light',
              }}
            >
              Depósito Bancário
            </Checkbox>
          </Checkbox.Group>
          
          <HStack  mt={10} justifyContent='space-between' alignItems='center'>
            <Button 
              variant='secondary' 
              title='Resetar filtros'
              w={160}
              onPress={handleResetFilter} 
            />
            <Button 
              variant='terceary' 
              title='Aplicar filtros'
              w={160} 
              onPress={handleSubmit(handleApplyFilters)} 
            />
          </HStack>


        </Box>
      </Box>
    </Modal>


      </Box>
    </Center>
          </ScrollView>
      }
    </>
    
  )
}

export default gestureHandlerRootHOC(Home);