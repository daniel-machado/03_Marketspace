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
import { PhotoFileDTO } from '@dtos/PhotoFileDTO'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Input } from '@components/Input'
import { Button } from '@components/Button'

interface FormDataProps {
  name: string
  description: string
  price: string
}

const createAdvertsSchema = yup.object({
  name: yup.string().required('Informe o nome do produto.'),
  description: yup.string().required('Informe a descrição do produto.'),
  price: yup.string().required('informe o valor do produto.')
});

export function CreateAdverts(){
  const [photos, setPhotos] = useState<PhotoFileDTO[]>([])
  const [productIsNew, setProductIsNew] = useState('')
  const [acceptTrade, setAcceptTrade] = useState(false)
  const [paymentMethods, setPaymentMethods]= useState<string[]>([])

  const toast = useToast()
  const navigation = useNavigation<AppNavigatorRoutesProps>();

  const { user } = useAuth()

  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    resolver: yupResolver(createAdvertsSchema),
  })

  function handleBackToHome() {
    navigation.navigate('home')
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

      if(photoSelected.assets[0].uri){
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);
        if(photoInfo.size && (photoInfo.size / 1024 / 1024) > 3){
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

        setPhotos(state => [...state, photoFile]);
      }  
    } catch (error) {
      console.log(error);
    }
  }

  function handleDeletePhotoSelected(item: string) {
    setPhotos(state => state.filter(img => img.name !== item))
  }

  function handleGoToPreviewProduct({ name, description, price }: FormDataProps) {
    const data = {
      name,
      description,
      is_new: productIsNew === 'novo' ? true : false,
      /* no back end na tabela de produtos, o price está como inteiro 
      sendo assim quando cria um produto com . ou , ele da error interno */
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
    navigation.navigate('previewProduct', { product: JSON.stringify(data)})
  }

  return(
    <ScrollView backgroundColor='gray.bg'>
      <Box safeArea px={5}>
        <HStack mt={5} alignItems='center' mb={6}>
          <Pressable onPress={handleBackToHome}>
            <Icon
              as={MaterialIcons} name='arrow-back' size={6} color='gray.100'
            />
          </Pressable>

          <Center flex={1}>
            <Heading>
              Criar anúncio
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
              <Box>
                <Image
                  source={{ uri: item.uri }} alt='Imagem do Produto'
                  h='100' w='100' rounded='lg' mr={2}
                />
                <Pressable 
                  w={4} h= {4} backgroundColor='gray.200' 
                  alignItems='center' justifyContent='center'
                  rounded='full' position='absolute' top='1' right='3'
                  onPress={() => handleDeletePhotoSelected(item.name)}
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
                w='100' h='100' backgroundColor='gray.500' 
                alignItems='center' justifyContent='center' rounded='lg'
                onPress={handleSelectedPhoto}
              >
                <Icon
                  as={MaterialIcons} name='add' size={6}color='gray.400'
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
            <Radio 
              value='novo'
              //colorScheme='blue.500'
            >
              Produto novo
            </Radio>
            <Radio 
              value='usado' 
              ml={5}
              //colorScheme="blue.500"
            >
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
                placeholder='R$ Valor do produto'
                onChangeText={onChange}
                value={value}
                errorMessage={errors.price?.message}
                keyboardType='numeric'
              />            
          )}
        />

        <Text fontFamily='heading' fontSize={16}>Aceita Troca?</Text>
        <HStack>
          <Switch 
            size='lg'
            offTrackColor='gray.500' onTrackColor='blue.500'
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
            Pix
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
            Dinheiro
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
            Cartão de Crédito
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
            Depósito Bancário
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