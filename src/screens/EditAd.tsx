import { useState } from 'react'
import { LogBox } from 'react-native'

import {
  Box,
  ScrollView,
  VStack,
  Heading,
  Text,
  HStack,
  Image,
  Button as NativeButton,
  useTheme,
  Radio,
  Checkbox,
  Switch,
  useToast,
} from 'native-base'

import { Controller, useForm } from 'react-hook-form'

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'

import { useNavigation, useRoute } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'

import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { AdHeader } from '@components/AdvertsHeader'

import { Plus, X } from 'phosphor-react-native'

import { AppError } from '@utils/AppError'

import { api } from '@services/api'
import { ButtonCreate } from '@components/ButtonCreate'

const editAdSchema = yup.object({
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

type FormDataProps = {
  title: string
  description: string
  price: string
}

export const EditAd = () => {
  const route = useRoute()

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

  const [isNew, setIsNew] = useState<boolean>(preIsNew)
  const [paymentMethods, setPaymentMethods] =
    useState<string[]>(prePaymentMethods)
  const [acceptTrade, setAcceptTrade] = useState<boolean>(preAcceptTrade)
  const [images, setImages] = useState<any[]>(preImages)
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    defaultValues: {
      title,
      description,
      price,
    },
    resolver: yupResolver(editAdSchema),
  })

  const { colors } = useTheme()

  const toast = useToast()

  const navigation = useNavigation<AppNavigatorRoutesProps>()

  const handleGoBack = () => {
    navigation.navigate('myad', { id })
  }

  const handleGoPreview = ({ title, description, price }: FormDataProps) => {
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

    navigation.navigate('adpreviewedit', {
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

  const handleAdPhotoSelect = async () => {
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      })

      if (photoSelected.canceled) {
        return
      }

      if (images.length > 2) {
        throw new AppError('Só pode selecionar 3 fotos!')
      }

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(
          photoSelected.assets[0].uri,
        )

        if (photoInfo.exists && photoInfo.size / 1024 / 1024 > 5) {
          return toast.show({
            title: 'Essa imagem é muito grande. Escolha uma de até 5MB.',
            placement: 'top',
            bgColor: 'red.500',
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

  type newObjProps = {
    data: string[]
  }

  const handleDeleteImage = async (id: string) => {
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
  return (
    <>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <AdHeader title="Editar Anúncio" mt={12} goBack={handleGoBack} />

        <VStack p={5} flex={1} alignItems="flex-start">
          <Heading color="gray.200" fontSize={18}>
            Imagens
          </Heading>
          <Text color="gray.300" fontSize={14}>
            Escolha até 3 imagens para mostrar o quando o seu produto é
            incrível!
          </Text>

          <HStack my={5}>
            {images.length > 0 &&
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
                    onPress={() => handleDeleteImage(imageData.id)}
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

            {images.length < 3 && (
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
                onPress={handleAdPhotoSelect}
              >
                <Plus color={colors.gray[400]} />
              </NativeButton>
            )}
          </HStack>

          <Heading color="gray.200" fontSize={18} my={2}>
            Sobre o produto
          </Heading>

          <Controller
            control={control}
            name="title"
            rules={{ required: 'Informe o título' }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Título"
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
                placeholder="Descrição"
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
            name="productCondition"
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

          <Heading color="gray.200" fontSize={16} mb={2} mt={5}>
            Venda
          </Heading>

          <Controller
            control={control}
            name="price"
            rules={{ required: 'Informe o preço!' }}
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="0,00"
                h="14"
                mb={0}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.price?.message}
              />
            )}
          />

          <Heading color="gray.200" fontSize={16} my={2}>
            Aceita troca?
          </Heading>

          <Switch
            onToggle={(value) => setAcceptTrade(value)}
            value={acceptTrade}
            size="lg"
            m={0}
          />

          <Heading color="gray.200" fontSize={16} my={2}>
            Meios de pagamento
          </Heading>

          <Checkbox.Group onChange={setPaymentMethods} value={paymentMethods}>
            <Checkbox value="boleto">
              <Text color="gray.300" fontSize={16}>
                Boleto
              </Text>
            </Checkbox>
            <Checkbox value="pix">
              <Text color="gray.300" fontSize={16}>
                Pix
              </Text>
            </Checkbox>
            <Checkbox value="cash">
              <Text color="gray.300" fontSize={16}>
                Dinheiro
              </Text>
            </Checkbox>
            <Checkbox value="card">
              <Text color="gray.300" fontSize={16}>
                Cartão de Crédito
              </Text>
            </Checkbox>
            <Checkbox value="deposit">
              <Text color="gray.300" fontSize={16}>
                Depósito Bancário
              </Text>
            </Checkbox>
          </Checkbox.Group>
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
            title="Cancelar"
            alignItems="center"
            justifyContent="center"
            w="47%"
            h={12}
            mt={2}
            onPress={handleGoBack}
          />
          <ButtonCreate
            title="Avançar"
            alignItems="center"
            justifyContent="center"
            w="47%"
            h={12}
            mt={2}
            isLoading={isLoading}
            variant="primary"
            onPress={handleSubmit(handleGoPreview)}
          />
        </HStack>
      </Box>
    </>
  )
}

// Procurando solução
LogBox.ignoreLogs([
  'We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320',
])