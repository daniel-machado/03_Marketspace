import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import {VStack,
        Text, 
        Heading,
        Center, 
        Pressable,
        ScrollView,
        useToast
      } from 'native-base';

import { AuthNavigatorRoutesProps } from '@routes/auth.routes';
import { useAuth } from '@hooks/useAuth';
import { api } from "@services/api";
import { AppError } from '@utils/AppError';


import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { AntDesign, MaterialIcons } from '@expo/vector-icons';

import Logo from '@assets/logoSVG.svg';
import defaultPhotoUser from '@assets/Avatar.png';

import { UserPhoto } from '@components/UserPhoto';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

interface userImageSelectedProps {
  selected: boolean
  photo: {
    uri: string
    name: string
    type: string
  }
}
interface FormDataProps {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirm: string;
}

const PHOTO_SIZE = 88;

const signUpSchema = yup.object({
  name: yup.string().required('Informe o nome.'),
  email: yup.string().required('Informe o e-mail.').email('E-mail inválido.'),
  phone: yup.string().required('Informe o telefone'),
  password: yup.string().required('Informe a senha.').min(6, 'A senha deve ter pelo menos 6 dígitos.'),
  password_confirm: yup.string().required('Confirme a senha.').oneOf([yup.ref('password')], 'A confirmação da senha não confere.')
});

export function SignUp(){
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [userImageSelected, setUserImageSelected] = useState({
    selected: false,
  } as userImageSelectedProps)
  const [isLoading, setIsLoading] = useState(false);
  
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
    },
    resolver: yupResolver(signUpSchema)
  });

  const toast = useToast();
  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const { singIn } = useAuth();
  const data = new FormData();

  function handleGoBack(){
    navigation.navigate('signIn');
  }

  async function handleSignUp( { name, email, phone, password}: FormDataProps){
    try{
      setIsLoading(true);
      
      if (!userImageSelected.selected) {
        return toast.show({
          title: 'Por favor selecione foto de perfil!',
          placement: 'top',
          bgColor: 'red.500',
        })
      }
      const { name } = getValues();
      const userImage = {
        ...userImageSelected.photo,
        name: `${name}.${userImageSelected.photo.name}`.toLowerCase(),
      } as any

      
      data.append('avatar', userImage);
      data.append('name', name.toLowerCase());
      data.append('email', email.toLowerCase());
      data.append('tel', phone);
      data.append('password', password);
      
      await api.post('/users', data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      await singIn(email, password);
   
    } catch (error) {
      setIsLoading(false);
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Não foi possível criar a conta. Tente novamente mais tarde';
      
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

  const handleUserPhotoSelect = async () => {
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

        setUserImageSelected({
          selected: true,
          photo: { ...photoFile },
        })

        toast.show({
          title: 'Foto selecionada!',
          placement: 'top',
          bgColor: 'green.500',
        })
      }
    } catch (error) {
      toast.show({
        title: 'Erro! Tente novamente mais tarde!',
        placement: 'top',
        bgColor: 'red.500',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }} 
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} bg="gray.bg" px={7} >
        <Center mt={10}>

          <Logo width={60} height={60}/>

          <Heading
            color="gray.100" 
            fontSize="xl" 
            fontFamily="heading"
          >
            Boas vindas!
          </Heading>

          <Text
            color="gray.300" 
            fontSize="sm" 
            fontFamily="body"
            textAlign="center"
            lineHeight="md"
            mt={2}
          >
            Crie sua conta e use o espaço para comprar{'\n'}
            Itens variados e vender seus produtos
          </Text>
        </Center>
        
        <Center>
          <Center my={5}>
            <UserPhoto
              source={userImageSelected.selected 
                ? {uri: userImageSelected.photo.uri }
                : defaultPhotoUser}
              alt="Imagem do Usuário"
              size={PHOTO_SIZE}
            />
            <Pressable
              w={10} h={10}  position='absolute'
              backgroundColor='blue.500'
              top={12}
              left={16}
              rounded='full'
              alignItems='center'
              justifyContent='center'
              onPress={handleUserPhotoSelect}
            >
              <AntDesign name="edit" size={16} color="white" />
            </Pressable>
          </Center>

          <Controller 
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <Input 
                placeholder="Telefone"
                keyboardType="phone-pad"
                maxLength={15}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.phone?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input 
                type={showPassword ? 'text' : 'password'}
                InputRightElement={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <MaterialIcons 
                      name={ showPassword ? "visibility" : "visibility-off" }
                      size={20} 
                      marginRight={10}
                      color='#9F9BA1'
                    />
                  </Pressable>
                }
                placeholder="Senha"
                autoCapitalize='none'
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller 
            control={control}
            name="password_confirm"
            render={({ field: { onChange, value } }) => (
              <Input 
              type={showConfirmPassword ? 'text' : 'password'}
              InputRightElement={
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialIcons 
                    name={ showConfirmPassword ? "visibility" : "visibility-off" }
                    size={20} 
                    marginRight={10}
                    color='#9F9BA1'
                  />
                </Pressable>
              }
                placeholder="Confirmar senha"
                autoCapitalize='none'
                onChangeText={onChange}
                value={value}
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}
              />
            )}
          />

          <Button
            title="Criar"
            variant="terceary"
            isLoading={isLoading}
            onPress={handleSubmit(handleSignUp)}
          />
        </Center>
        
        <Center flex={1} px={7} pb={10}  mt={8}>
          <Text 
            color="gray.200" 
            fontSize="sm" 
            mb={3} 
            fontFamily="body"
          >
            Já tem uma conta?
          </Text>

          <Button 
            title="Ir para o login"
            variant="secondary" 
            onPress={handleGoBack}
          />
        </Center>
      </VStack>
    </ScrollView>
  )
}