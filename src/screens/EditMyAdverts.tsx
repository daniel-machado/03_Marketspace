import { Dimensions } from 'react-native'
import { useCallback, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { MaterialIcons } from '@expo/vector-icons'
import { yupResolver } from '@hookform/resolvers/yup'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { 
  HStack, 
  Text, 
  Icon, 
  Box, 
  Heading, 
  Center, 
  ScrollView, 
  Pressable, 
  Image, 
  Radio, 
  Switch, 
  Checkbox, 
  useToast, 
  FlatList 
} from 'native-base'

import * as yup from 'yup'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'

import { api } from '@services/api'
import { useAuth } from '@hooks/useAuth'
import { AppError } from '@utils/AppError'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { Loading } from '@components/Loading'

interface FormDataProps {
  name: string
  description: string
  price: string
}

interface RouteParamsProps {
  productId: string
}

const createAdSchema = yup.object({
  name: yup.string().required('Informe o nome do produto.'),
  description: yup.string().required('Informe a descrição do produto.'),
  price: yup.string().required('informe o valor do produto.')
})

export function EditMyAdverts() {
  const [isLoading, setIsLoading] = useState(false)
  const [photos, setPhotos] = useState<any[]>([])
  const [photoToDelete, setPhotoToDelete] = useState<string[]>([])
  const [productIsNew, setProductIsNew] = useState('')
  const [acceptTrade, setAcceptTrade] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])

  const toast = useToast()
  const route = useRoute()
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const height = Dimensions.get('window').height;

  const { productId } = route.params as RouteParamsProps

  const { user } = useAuth()

  const { control, handleSubmit, setValue,formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(createAdSchema),
  })

  function handleBackToHome() {
    navigation.navigate('myProduct', { myProductId: productId })
  }

  async function fetchProductToEdit() {
    try {
      setIsLoading(true)
      const { data } = await api.get(`/products/${productId}`)

      setValue('name', data.name)
      setValue('description', data.description)
      setValue('price', String(data.price))

      setAcceptTrade(data.accept_trade)
      setPhotos(data.product_images)
      setProductIsNew(data.is_new ? 'novo': 'usado')
      setPaymentMethods(data.payment_methods.map((item: { key: string, name:  string}) => {
        return item.key
      }))
    } catch(error) {
      const isAppError = error instanceof AppError
      const title = isAppError ? error.message : 'Não foi possível carregar os dados.'

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

  async function handleSelectorPhotos() {
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        selectionLimit: 3,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })

      if(photoSelected.canceled) {
        return
      }

      if(photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);

        if(photoInfo.size && (photoInfo.size / 1024 / 1024) > 3) {
          return toast.show({
            title: 'Imagem muito grande, escolha uma imagem até 3mb',
            placement: 'top',
            bgColor: 'red.500'
          })
        }

        const fileExtension = photoSelected.assets[0].uri.split('.').pop()

        const photoFile = {
          name: `${user.name}_${Math.random()}.${fileExtension}`,
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any;
        
        setPhotos(state => [...state, photoFile])
      }
    } catch(error) {
      console.log(error)
    }
  }

  function handleDeletePhotoSelected(item: string, imageId: string | null) {
    setPhotos(state => state.filter(img => img.name !== item))

    if(imageId) {
      setPhotoToDelete(state => [...state, imageId])
    }
  }

  function handleGoToPreviewProduct({ name, description, price }: FormDataProps) {
    const data = {
      id: productId,
      name,
      description,
      is_new: productIsNew === 'novo' ? true : false,
      price: Number(price),
      accept_trade: acceptTrade,
      payment_methods: paymentMethods,
      product_images: photos,
      user: {
        avatar: user.avatar,
        name: user.name,
        tel: user.tel
      }
    }

    navigation.navigate('previewProduct', { 
      product: JSON.stringify(data),
      edit: true
    })
  }

  useFocusEffect(
    useCallback(() => {
      fetchProductToEdit();
    }, [productId])
  )

  if(isLoading) {
    return (
      <Box h={height} alignItems='center' justifyContent='center'>
        <Loading />
      </Box>
    )
  }

  return(
    <ScrollView backgroundColor='gray.700'>
      <Box safeArea px={5}>
        <HStack mt={5} alignItems='center' mb={6}>
          <Pressable onPress={handleBackToHome}>
            <Icon
              as={MaterialIcons} name='arrow-back' size={6}color='gray.100'
            />
          </Pressable>

          <Center flex={1}>
            <Heading>
              Editar anúncio
            </Heading>
          </Center>
        </HStack>

        <Text fontFamily='heading' fontSize={16} mb={1}>
          Imagens
        </Text>

        <Text color='gray.300' mb={4}>
          Escolha até 3 imagens para mostrar o quanto o seu produto é incrível!
        </Text>

        <HStack mb={6}>
          <FlatList 
            data={photos}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <Box key={item.name}>
                <Image
                  source={{ uri: item.uri || `${api.defaults.baseURL}/images/${item.path}` }} alt='Imagem do Produto'
                  h='100' w='100' rounded='lg'mr={2}
                />
                <Pressable 
                  w={4} h= {4} backgroundColor='gray.200' 
                  alignItems='center' justifyContent='center'
                  rounded='full' position='absolute' top='1' right='3'
                  onPress={() => handleDeletePhotoSelected(item.name, item.path)}
                >
                  <Icon
                    as={MaterialIcons} name='close'
                    size={3} color='gray.700'
                  />
                </Pressable>
              </Box>
            )}
            horizontal showsHorizontalScrollIndicator={false}
            ListFooterComponent={
              <Pressable 
                w='100' h='100' backgroundColor='gray.500' alignItems='center' justifyContent='center' rounded='lg'
                onPress={handleSelectorPhotos}
              >
                <Icon
                  as={MaterialIcons} name='add' size={6} color='gray.400'
                />
              </Pressable>
            }
          />
        </HStack>

        <Text fontFamily='heading' fontSize={16} mb={4}>
          Sobre o produto
        </Text>

        <Controller
          control={control}
          name='name'
          render={({ field: { onChange, value }}) => (
            <Input 
              placeholder='Nome do produto'
              onChangeText={onChange}
              value={value}
              errorMessage={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name='description'
          render={({ field: { onChange, value }}) => (
            <Input
              h='140' multiline={true} maxLength={100} textAlignVertical='top'
              placeholder='Descrição do produto'
              onChangeText={onChange}
              value={value}
              errorMessage={errors.description?.message}
            />
          )}
        />

        <Radio.Group 
          name='ProductsRadio' 
          value={productIsNew} 
          onChange={nextValue => setProductIsNew(nextValue)}
        >
          <HStack>
            <Radio value='novo'>
              Produto novo
            </Radio>
            <Radio value='usado' ml={5}>
              Produto usado
            </Radio>
          </HStack>
        </Radio.Group>

        <Text fontFamily='heading' fontSize={16} mt={4} mb={4}>
          Venda
        </Text>

        <Controller
          control={control}
          name='price'
          render={({ field: { onChange, value }}) => (
            <Input
              placeholder='R$ 45,00'
              onChangeText={onChange}
              value={value}
              errorMessage={errors.price?.message}
            />
          )}
        />

        <Text fontFamily='heading' fontSize={16}>
          Aceita Troca?
        </Text>

        <HStack>
          <Switch 
            size='lg' offTrackColor='gray.500' onTrackColor='blue-light'
            onThumbColor='gray.500' offThumbColor='gray.500'
            value={acceptTrade}
            onValueChange={(e) => setAcceptTrade(e)}
          />
        </HStack>

        <Text fontFamily='heading' fontSize={16} mb={3}>
          Meios de pagamento aceitos
        </Text>

        <Checkbox.Group value={paymentMethods} onChange={setPaymentMethods}>
          <Checkbox 
            value='boleto'
            mb={2}
            _checked={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
            _pressed={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
          >
            Boleto
          </Checkbox>

          <Checkbox 
            value='pix'
            mb={2}
            _checked={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
            _pressed={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
          >
            Pix
          </Checkbox>

          <Checkbox 
            value='cash'
            mb={2}
            _checked={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
            _pressed={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
          >
            Dinheiro
          </Checkbox>

          <Checkbox 
            value='card'
            mb={2}
            _checked={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
            _pressed={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
          >
            Cartão de Crédito
          </Checkbox>

          <Checkbox 
            value='deposit'
            _checked={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
            _pressed={{
              bg: 'blue-light',
              borderColor: 'blue-light'
            }}
          >
            Depósito Bancário
          </Checkbox>
        </Checkbox.Group>

        <HStack mt={10} mb={10} justifyContent='space-between' alignItems='center'>
          <Button variant='secondary' w={150} title='Cancelar' onPress={handleBackToHome}/>
          <Button
            w={150} backgroundColor='gray.100' title='Avançar'
            onPress={handleSubmit(handleGoToPreviewProduct)} 
          />
        </HStack>
      </Box>
    </ScrollView>
  )
}
