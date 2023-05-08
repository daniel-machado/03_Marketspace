import { LogBox, Dimensions } from 'react-native'
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
  Button as NativeButton,
  Pressable, 
  Image, 
  Radio, 
  Switch, 
  Checkbox, 
  useToast, 
  FlatList 
} from 'native-base'

import { Plus, X } from 'phosphor-react-native'

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
import { AdHeader } from '@components/AdvertsHeader'

interface FormDataProps {
  title: string
  description: string
  price: string
}

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

const createAdSchema = yup.object({
  title: yup
    .string()
    .required('Informe um título.')
    .min(6, 'O título deve ter no mínimo 6 letras.'),
  description: yup
    .string()
    .required('Informe uma descrição.')
    .min(20, 'A descrição deve ser detalhada!'),
  price: yup.string().required('Informe um preço.'),
})


export function EditAdverts() {
  const toast = useToast();
  const route = useRoute();
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const {
    title,
    description,
    price,
    images: preImages,
    paymentMethods: prePaymentMethods,
    isNew: preIsNew,
    acceptTrade: preAcceptTrade,
    id,
  } = route.params as RouteParams

  const [isLoading, setIsLoading] = useState(false)
  const [isNew, setIsNew] = useState<boolean>(preIsNew);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(prePaymentMethods)
  const [acceptTrade, setAcceptTrade] = useState(false)
  const [images, setImages] = useState<any[]>(preImages)
  const [photoToDelete, setPhotoToDelete] = useState<string[]>([])
 
  const height = Dimensions.get('window').height;

  const { user } = useAuth()

  const { control, 
          handleSubmit, 
          formState: { errors } 
        } = useForm<FormDataProps>({
          defaultValues: {
            title,
            description,
            price,
        },
        resolver: yupResolver(createAdSchema),
      });

  type newObjProps = {
    data: string[]
  }

  function handleBackToHome() {
    navigation.navigate('myProduct', { id })
  }

  function handleGoToPreviewProduct({ title, description, price }: FormDataProps) {
    if (images.length === 0) {
      return toast.show({
        title: 'Selecione ao menos uma imagem!',
        placement: 'top',
        bgColor: 'red.500',
      })
    }
    if (paymentMethods.length === 0) {
      return toast.show({
        title: 'Selecione ao menos um meio de pagamento!',
        placement: 'top',
        bgColor: 'red.500',
      })
    }

    navigation.navigate('previewEditAdverts', {
      title,
      description,
      price,
      images,
      paymentMethods,
      isNew,
      acceptTrade,
      id,
    })
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
      if (images.length > 2) {
        throw new AppError('Só pode selecionar 3 fotos!')
      }

      if(photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri);

        if(photoInfo.exists && (photoInfo.size / 1024 / 1024) > 3) {
          return toast.show({
            title: 'Imagem muito grande, escolha uma imagem até 3mb',
            placement: 'top',
            bgColor: 'red.500'
          })
        }
        const fileExtension = photoSelected.assets[0].uri.split('.').pop()
        const photoFile = {
          name: `${fileExtension}`.toLowerCase(),
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any
        
        setImages((images) => {
          return [...images, photoFile]
        })

        toast.show({
          title: 'Foto selecionada!',
          placement: 'top',
          bgColor: 'green.500',
        })
      }
    } catch(error) {
      const isAppError = error instanceof AppError
      const title = isAppError
        ? error.message
        : 'Não foi possível selecionar a imagem. Tente novamente!'

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

  async function handleDeletePhotoSelected(id: string) {
    /*  setPhotos(state => state.filter(img => img.name !== item))
      if(imageId) {
        setPhotoToDelete(state => [...state, imageId])
      }*/
      if (id) {
        const newObj: newObjProps = {
          data: [id],
        }
        const newArray = images.filter((item) => item.id !== id)
  
        await api.delete('/products/images', newObj)
        setImages(newArray)
      } else {
        const newArray = images.filter((item) => item.id !== id)
        setImages(newArray)
      }
    }

    /*
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
*/
 /*
  useFocusEffect(
    useCallback(() => {
      fetchProductToEdit();
    }, [productId])
  )
*/
  return(
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      backgroundColor='gray.700'
    >
      <Box safeArea px={5}>
        <AdHeader title="Editar Anúncio" mt={12} goBack={handleBackToHome}/>

        <Text fontFamily='heading' fontSize={16} mb={1}>
          Imagens
        </Text>

        <Text color='gray.300' mb={4}>
          Escolha até 3 imagens para mostrar o quanto o seu produto é incrível!
        </Text>

        <HStack my={5}>
          { images.length > 0 &&
            images.map((imageData, index) => (
              <Box key={index} ml={2}>
                <NativeButton
                    position="absolute"
                    zIndex={100}
                    borderRadius={9999}
                    left={85}
                    top={1}
                    w={5}
                    h={6}
                    bg="gray.200"
                    _pressed={{
                      bg: 'gray.500',
                    }}
                    onPress={() => handleDeletePhotoSelected(imageData.id)}
                  >
                    <Box justifyContent="center" alignItems="center">
                      <X size={12} weight="fill" color="white" />
                    </Box>
                  </NativeButton>
                  <Image
                    w={110}
                    h={110}
                    source={{
                      uri: imageData.uri
                        ? imageData.uri
                        : `${api.defaults.baseURL}/images/${imageData.path}`,
                    }}
                    alt="Imagem do novo anúncio"
                    resizeMode="cover"
                    borderRadius={8}
                  />
              </Box>
            ))}
          
            { images.length < 3 && (
                <NativeButton
                  bg="gray.500"
                  w={110}
                  h={110}
                  ml={2}
                  _pressed={{
                  borderWidth: 1,
                  bg: 'gray.500',
                  borderColor: 'gray.600',
                }}
                onPress={handleSelectorPhotos}
              >
                <Plus color="gray.400" />
              </NativeButton>
              )}
          </HStack>

        <Heading fontFamily='heading' fontSize={16} my={3}>
          Sobre o produto
        </Heading>

        <Controller
          control={control}
          name='title'
          render={({ field: { onChange, value }}) => (
            <Input 
              placeholder='Titulo do Anúncio'
              onChangeText={onChange}
              value={value}
              errorMessage={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name='description'
          rules={{ required: 'Informe a descrição' }}
          render={({ field: { onChange, value }}) => (
            <Input
              h='140'
              multiline={true} 
              numberOfLines={5}
              maxLength={150} 
              textAlignVertical='top'
              placeholder='Descrição do produto'
              onChangeText={onChange}
              value={value}
              errorMessage={errors.description?.message}
            />
          )}
        />

        <Radio.Group 
          name='productCondition' 
          value={isNew ? 'new' : 'used'} 
          onChange={(nextValue) => {
            setIsNew(nextValue === 'new')
          }}
        >
          <HStack>
            <Radio value="new" my="2" size="sm">
            <Text color="gray.200" fontSize={14}>
                  Produto novo
                </Text>
            </Radio>

            <Radio value="used" my="2" ml={5} size="sm">
              <Text color="gray.200" fontSize={14}>
                Produto usado
              </Text>
            </Radio>
          </HStack>
        </Radio.Group>

        <Heading fontFamily='heading' fontSize={16} mt={4} mb={4}>
          Venda
        </Heading>

        <Controller
          control={control}
          name='price'
          rules={{ required: 'Informe o preço!' }}
          render={({ field: { onChange, value }}) => (
            <Input
              placeholder='R$ 45,00'
              onChangeText={onChange}
              h="14"
              mb={0}
              value={value}
              errorMessage={errors.price?.message}
            />
          )}
        />

        <Heading fontFamily='heading' color="gray.200" fontSize={16} my={2}>
          Aceita Troca?
        </Heading>

        <HStack>
          <Switch 
            size='lg' offTrackColor='gray.500' onTrackColor='blue-light'
            onThumbColor='gray.500' offThumbColor='gray.500'
            value={acceptTrade} m={0}
            onValueChange={(e) => setAcceptTrade(e)}
          />
        </HStack>

        <Heading fontFamily='heading' color="gray.200" fontSize={16} mb={3}>
          Meios de pagamento aceitos
        </Heading>

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
            <Text color="gray.300" fontSize={16}>
              Boleto
            </Text>
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
            <Text color="gray.300" fontSize={16}>
              Pix
            </Text>
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
            <Text color="gray.300" fontSize={16}>
              Dinheiro
            </Text>
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
            <Text color="gray.300" fontSize={16}>
              Cartão de Crédito
            </Text>
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
            <Text color="gray.300" fontSize={16}>
              Depósito Bancário
            </Text>
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

// Procurando solução
LogBox.ignoreLogs([
  'We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320',
])