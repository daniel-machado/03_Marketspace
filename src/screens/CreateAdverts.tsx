import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
  Button as NativeButton,
  Radio, 
  Switch, 
  Checkbox, 
  useToast, 
  FlatList,
} from 'native-base'

import { MaterialIcons } from '@expo/vector-icons'
import { yupResolver } from '@hookform/resolvers/yup'
import { useNavigation } from '@react-navigation/native'

import * as yup from 'yup'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'

import { useAuth } from '@hooks/useAuth'
import { ImageDTO } from '@dtos/ImageDTO'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { AppError } from '@utils/AppError'
import { AdHeader } from '@components/AdvertsHeader'
import { Plus, X } from 'phosphor-react-native'
import { api } from '@services/api'

interface FormDataProps {
  title: string
  description: string
  price: string
}

const createAdvertsSchema = yup.object({
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

export function CreateAdverts(){
  const [images, setImages] = useState<any[]>([])
  const [isNew, setIsNew] = useState('')
  const [acceptTrade, setAcceptTrade] = useState(false)
  const [paymentMethods, setPaymentMethods]= useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const { user } = useAuth()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    defaultValues: {
      title: '',
      description: '',
      price: '',
    },
    resolver: yupResolver(createAdvertsSchema),
  })

  function handleBackToHome() {
    navigation.goBack();
  }

  async function handleSelectedPhoto(){
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        selectionLimit: 3,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true
      });

      if(photoSelected.canceled) {
        return;
      }

      if (images.length > 2) {
        throw new AppError('Só pode selecionar 3 fotos!')
      }

      if(photoSelected.assets[0].uri){
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);
        if(photoInfo.exists && (photoInfo.size / 1024 / 1024) > 3){
          return toast.show({
            title: "Essa imagem é muito grande. Escolha uma de até 3MB.",
            placement: 'top',
            bgColor: 'red.500',
            duration: 3000
          })
        }
        const fileExtension = photoSelected.assets[0].uri.split('.').pop();
        
        const photoFile = {
          name: `${user.name}_${Math.random()}.${fileExtension}`,
          uri: photoSelected.assets[0].uri,
          type: `${photoSelected.assets[0].type}/${fileExtension}`,
        } as any;

        setImages(state => [...state, photoFile]);
        toast.show({
          title: 'Foto selecionada!',
          placement: 'top',
          bgColor: 'green.500',
         })
      }  
    } catch (error) {
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

  function handleDeletePhotoSelected(id: string) {
    const newArray = images.filter((item) => item.path !== id);
    setImages(newArray);
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

    navigation.navigate('previewAdverts', {
      title,
      description,
      price, 
      images,
      paymentMethods,
      isNew: isNew === 'novo' ? true : false,
      acceptTrade,
    })
  }

  return(
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      backgroundColor='gray.bg'
    >  
      <Box safeArea px={5}>
        <AdHeader title="Criar Anúncio" mt={12} goBack={handleBackToHome} />

        <Heading fontFamily='heading' fontSize={16} mb={1}>
          Imagens
        </Heading>

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
                    source={{ uri: imageData.uri }}
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
                onPress={handleSelectedPhoto}
              >
                <Plus color="gray.400" />
              </NativeButton>
              )}
          </HStack>

        <Heading fontFamily='heading' fontSize={16} mb={4}>
          Sobre o produto
        </Heading>

        <Controller
          control={control}
          name='title'
          rules={{ required: 'Informe o título' }}
          render={({ field: { onChange, value }}) => (
            <Input 
              placeholder='Nome do produto'
              onChangeText={onChange}
              value={value}
              errorMessage={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          rules={{ required: 'Informe a descrição' }}
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Descrição do produto"
              multiline={true}
              numberOfLines={5}
              textAlignVertical="top"
              onChangeText={onChange}
              value={value}
              errorMessage={errors.description?.message}
            />
          )}
        />

        <Radio.Group 
          name='productCondition' 
          value={isNew} 
          onChange={nextValue => setIsNew(nextValue)}
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
                placeholder='R$ Valor do produto'
                onChangeText={onChange}
                h="14"
                mb={0}
                value={value}
                errorMessage={errors.price?.message}
                keyboardType='numeric'
              />            
          )}
        />

        <Heading fontFamily='heading' fontSize={16}>
          Aceita Troca?
        </Heading>

        <HStack>
          <Switch 
            size='lg'
            offTrackColor='gray.500' onTrackColor='blue.500'
            onThumbColor='gray.500' offThumbColor='gray.500'
            value={acceptTrade}
            onValueChange={(e) => setAcceptTrade(e)}
          />
        </HStack>

        <Heading fontFamily='heading' fontSize={16} mb={3}>
          Meios de pagamento aceitos
        </Heading>

        <Checkbox.Group 
          value={paymentMethods} 
          onChange={(value) => setPaymentMethods(value)}
          accessibilityLabel="Escolha o método de pagamento."
          m={1}
        >
          <Checkbox 
            value='boleto'
            mb={2}
            _checked={{
              bg: 'blue.500',
              borderColor: 'blue.500'
            }}
            _pressed={{
              bg: 'blue.500',
              borderColor: 'blue.500'
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
              bg: 'blue.500',
              borderColor: 'blue.500'
            }}
            _pressed={{
              bg: 'blue.500',
              borderColor: 'blue.500'
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
              bg: 'blue.500',
              borderColor: 'blue.500'
            }}
            _pressed={{
              bg: 'blue.500',
              borderColor: 'blue.500'
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
              bg: 'blue.500',
              borderColor: 'blue.500'
            }}
            _pressed={{
              bg: 'blue.500',
              borderColor: 'blue.500'
            }}
          >
            <Text color="gray.300" fontSize={16}>
              Cartão de Crédito
            </Text>
          </Checkbox>

          <Checkbox 
            value='deposit'
            _checked={{
              bg: 'blue.500',
              borderColor: 'blue.500'
            }}
            _pressed={{
              bg: 'blue.500',
              borderColor: 'blue.500'
            }}
          >
            <Text color="gray.300" fontSize={16}>
              Depósito Bancário
            </Text>
          </Checkbox>
        </Checkbox.Group>

        <HStack 
          mt={10} 
          mb={10} 
          justifyContent='space-between' 
          alignItems='center'
        >
          <Button 
            onPress={handleBackToHome} 
            title='Cancelar' 
            variant='secondary' 
            w={160} 
          />
          <Button 
            w={160} 
            variant='terceary'  
            title='Avançar' 
            onPress={handleSubmit(handleGoToPreviewProduct)}
          />
        </HStack>
      </Box>
    </ScrollView>
  )
}