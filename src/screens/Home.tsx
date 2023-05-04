import { useState, useCallback, useRef, useMemo } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native'

import BottomSheet, {
  BottomSheetView
} from '@gorhom/bottom-sheet';

import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import Animated from "react-native-reanimated";


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
        Checkbox
      } from 'native-base';

import { api } from '@services/api'

import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';

import { Input } from '@components/Input';
import { HomeHeader } from '@components/HomeHeader';
import { AppNavigatorRoutesProps } from '@routes/app.routes';
import { ProductDTO } from '@dtos/ProductDTO';
import { AppError } from '@utils/AppError';
import { Loading } from '@components/Loading';
import { Card } from '@components/Card';
import { FilterButton } from '@components/FilterButton';
import { Button } from '@components/Button';


function Home(){
  const { sizes, colors } = useTheme();

  const [nameOfProduct, setNameOfProduct] = useState('')
  const [productActiveCount, setProductActiveCount] = useState(0)
  const [productsAdvert, setProductsAdvert] = useState<ProductDTO[]>([])
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [isNew, setIsNew] = useState<boolean | undefined>(undefined)

  const [showModal, setShowModal] = useState(false);
  const [acceptTrade, setAcceptTrade] = useState(false); 
  const [isLoadingProduct, setIsLoadingProduct] = useState(false); 
  const [selectNew, setSelectNew] = useState(false)
  const [selectOld, setSelectOld] = useState(false)

  const toast = useToast();
  const navigation = useNavigation<AppNavigatorRoutesProps>();

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
      console.log
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

  async function fetchUserProduct(){
    try{
      const { data } = await api.get('users/products');
      const amounts = data.filter((amount: ProductDTO) => amount.is_active)
      setProductActiveCount(amounts.length);
    } catch(error){
      throw error
    } finally {
      setIsLoadingProduct(false);
    }
  }

  function handleGoToAnnouncement(){
    navigation.navigate('myAdverts');
  }

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  function handleApplyFilter() {
    setShowModal(false)
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
    setIsNew(undefined)
    setSelectOld(false)
    setSelectNew(false)
    setPaymentMethods([])
  }


  useFocusEffect(
    useCallback(() => {
      fetchListAllProduct()
    }, [ ,isNew, acceptTrade, paymentMethods ])
  )

  useFocusEffect(
    useCallback(() => {
      fetchUserProduct()
    }, [productActiveCount])
  )

  return (
    <ScrollView flex={1} bg='gray.bg'>
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
                <HStack
                  alignItems='center'
                >
                  <AntDesign 
                    name="tago" 
                    size={28} 
                    color={colors.blue[700]} 
                  />
                  <VStack
                    ml={3}
                  >
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

                <Pressable
                  onPress={handleGoToAnnouncement}
                >
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

            <Input
              InputRightElement={
                <HStack mr={5} >
                  <Pressable
                    onPress={fetchListAllProduct}
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
              value={nameOfProduct}
              onChangeText={setNameOfProduct}
            />

          </VStack>

          <Box
            flexDirection='row' 
            flexWrap='wrap' 
            justifyContent='space-between'
          >
              { isLoadingProduct 
                ? 
                  <Center flex={1} mt={150}>
                    <Loading />
                  </Center> 
                :
                  
                  <Box
                  flexDirection='row'  
                  flexWrap='wrap' 
                  justifyContent='space-between'
                  >
                    {
                      productsAdvert.map( (item) => (
                        <Card key={item.id} item={item} />
                      )) 
                    }
                  </Box>                  
              }
          </Box>
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
                  size='lg' offTrackColor='gray.500' onTrackColor='blue.500'
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
                  bg: 'blue.500',
                  borderColor: 'blue.500'
                }}
                _pressed={{
                  bg: 'blue.500',
                  borderColor: 'blue.500'
                }}
              >
                Boleto
              </Checkbox>

              <Checkbox 
                value='pix' mb={2}
                _checked={{
                  bg: 'blue.500',
                  borderColor: 'blue.500'
                }}
                _pressed={{
                  bg: 'blue.500',
                  borderColor: 'blue.500'
                }}
              >
                Pix
              </Checkbox>

              <Checkbox 
                value='dinheiro' mb={2}
                _checked={{
                  bg: 'blue.500',
                  borderColor: 'blue.500',
                }}
                _pressed={{
                  bg: 'blue.500',
                  borderColor: 'blue.500',
                }}
              >
                Dinheiro
              </Checkbox>

              <Checkbox 
                value='credito' mb={2}
                _checked={{
                  bg: 'blue.500',
                  borderColor: 'blue.500',
                }}
                _pressed={{
                  bg: 'blue.500',
                  borderColor: 'blue.500',
                }}
              >
                Cartão de Crédito
              </Checkbox>

              <Checkbox 
                value='deposito'
                _checked={{
                  bg: 'blue.500',
                  borderColor: 'blue.500',
                }}
                _pressed={{
                  bg: 'blue.500',
                  borderColor: 'blue.500',
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
                onPress={handleApplyFilter} 
              />
            </HStack>


          </Box>
        </Box>
      </Modal>


        </Box>
      </Center>
    </ScrollView>
    
  )
}

export default gestureHandlerRootHOC(Home);