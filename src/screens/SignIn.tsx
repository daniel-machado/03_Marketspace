import { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import {VStack,  
        Text, 
        Center, 
        Heading, 
        ScrollView,
        useToast,
        Pressable
      } from 'native-base';
      
import * as yup from 'yup'
import { MaterialIcons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup'

import { AuthNavigatorRoutesProps } from '../routes/auth.routes';
import { useAuth } from '@hooks/useAuth';

import Logo from '@assets/logoSVG.svg';
import { Input } from '@components/Input';
import { Button } from '@components/Button';

import { AppError } from '@utils/AppError';

interface FormData {
  email: string;
  password: string;
}

const signInSchema = yup.object({
  email: yup.string().required('Informe seu e-mail.').email('E-mail inválido.'),
  password: yup.string().required('Informe a senha.').min(6, 'A senha deve ter pelo menos 6 dígitos.'),
})

export function SignIn(){
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  })

  const { singIn, signOut } = useAuth();
  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const toast = useToast();

 
  function handleNewAccount(){
    navigation.navigate('signUp');
  }

  async function handleSignIn({ email, password }: FormData){
    try{
      setIsLoading(true);
      await singIn(email, password);

    } catch (error) {
      const isAppError = error instanceof AppError;

      const title = isAppError ? error.message : 'Não foi possível entrar. Tente novamente mais tarde.'
      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
        duration: 3000,
      })
      setIsLoading(false);
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getOut = async () => {
      await signOut()
    }
    getOut()
  }, [])

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      bg="gray.600"
    >
      <VStack borderBottomRadius={20} flex={1} bg="gray.700" px={7}>
        <Center my={24}>
          <Logo/>
          <Text 
            color="gray.100" 
            fontSize="title" 
            fontFamily="heading"
          >
            marketspace
          </Text>
          <Text
            color="gray.300" 
            fontSize="sm" 
            fontFamily="body"
            mt={-2}
          >
            Seu espaço de compra e venda
          </Text>
        </Center>

        <Center>
          <Heading
            color="gray.200"
            fontSize="sm"
            mb={5}
            fontFamily="body"
          >
            Acesse sua conta
          </Heading>

          <Controller 
            control={control}
            name="email"
            rules={{ required: 'Informe o e-mail' }}
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
            name="password"
            rules={{ required: 'Informe a senha' }}
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
          
          <Button 
            mt={6} 
            title="Entrar"
            onPress={handleSubmit(handleSignIn)}
            isLoading={isLoading}
          />
            
        </Center>
      </VStack>

      <Center flex={1} px={7} pt={7}>
          <Text 
            color="gray.200" 
            fontSize="sm" 
            mb={3} 
            fontFamily="body"
          >
            Ainda não tem acesso?
          </Text>

          <Button 
            title="Criar uma conta"
            variant="secondary" 
            onPress={handleNewAccount}
          />
        </Center>
    </ScrollView>
  )
}