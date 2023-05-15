import { useMemo, useCallback, forwardRef, useEffect, useState } from 'react';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { BottomSheetModal,  BottomSheetScrollView, BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { Checkbox, Heading, HStack, Pressable, Switch, Text, useTheme, View, VStack } from 'native-base';
import { X } from 'phosphor-react-native';
import { useForm, Controller } from "react-hook-form";

import { useForwardRef } from '@hooks/UseFowardRef';
import { Tag } from './Tag';
import { Button } from './Button';
import { LogBox } from 'react-native';

export type ModalFormData = {
  accept_trade: undefined | boolean;
  payment_methods: Array<string> | undefined;
}

export type BottomSheetModalProps = {
  handleSetFilters: (data: ModalFormData) => void;
}

export const FilterModal = forwardRef<BottomSheetModal, BottomSheetModalProps>(({handleSetFilters}, ref) => {
  const [isNew, setIsNew] = useState<boolean | undefined>()
  const myRef = useForwardRef<BottomSheetModal | null>(ref);

  const { handleSubmit, control, reset } = useForm<ModalFormData>({
    defaultValues: {
      accept_trade: undefined,
      payment_methods: undefined,
    }
  });

  const { colors } = useTheme();
  
  const snapPoints = useMemo(() => ['25%', '80%'], []);

  const handlePresentModalPress = useCallback(() => {
    myRef.current?.dismiss();
  }, []);

  function handleResetFilters() {
    reset();
    setIsNew(undefined);
  }

  function handleApplyFilters(data: ModalFormData) {
    const filters = {
      ...data,
      isNew,
    }
    handleSetFilters(filters);
    myRef.current?.dismiss();
  }

  return (
    <BottomSheetModal
          ref={myRef}
          index={1}
          snapPoints={snapPoints}
          handleStyle={{
            height: 35,
          }}
          handleIndicatorStyle={{
            backgroundColor: colors.gray['300'],
            width: 56,
          }}
          style={{
            shadowColor: "#000000",
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.,
            shadowRadius: 11.14,

            elevation: 17,
          }}
          backgroundStyle={{backgroundColor: colors.gray['100']}}
        >
        <HStack 
            width="full" 
            justifyContent="space-between" 
            alignItems="center"
            px={6}
            flex={1}
            maxH={8}
          >
            <Heading fontFamily="heading" fontSize="lg">Filtrar anúncios</Heading>
            <Pressable 
              onPress={handlePresentModalPress} 
              width={10} height={10} 
              justifyContent="center"
              alignItems="center"
            >
              <X size={24} color={colors.gray[400]}/>
            </Pressable>
          </HStack>
          <BottomSheetScrollView
            contentContainerStyle={{
              alignItems: "center",
            }}
            
            style={{
              flex: 1,
              padding: 24,
              paddingTop: 16,
            }}
          >
            <VStack width="full" mb={8}>
              <Text color="gray.600" fontWeight="bold" mb={3}>Condição</Text>
              <View flexDirection="row">
                <Tag 
                  title='NOVO' 
                  isChecked={isNew !== undefined && isNew === true ? true : false} 
                  bg={isNew !== undefined 
                      ? isNew === true 
                      ? 'blue.500' 
                      : 'gray.300' 
                      : 'gray.300'}
                  color={isNew ? "gray.100" : "gray.500"}
                  onPress={() => setIsNew(true)}
                />
                <Tag 
                  title='USADO' 
                  ml={2}
                  isChecked={isNew !== undefined && isNew === false ? true : false} 
                  bg={isNew !== undefined ? isNew === false ? 'blue.500' : 'gray.300' : 'gray.300'}
                  color={!isNew ? "gray.100" : "gray.500"}
                  onPress={() => setIsNew(false)}
                />
              </View>
            </VStack>

            <VStack width="full" mb={4} alignItems="flex-start">
              <Text color="gray.600" fontWeight="bold" mb={1}>Aceita troca?</Text>

              <Controller 
                name="accept_trade"
                control={control}
                render={({field: {onChange, value}}) => (
                  <Switch 
                    size='lg'
                    offTrackColor='gray.300'
                    offThumbColor="gray.200"

                    onTrackColor="blue.600"
                    onThumbColor="gray.200"
                  
                    onToggle={onChange}
                    isChecked={value}
                    defaultIsChecked={false}
                  />
                )}
              />
            </VStack>

            <VStack width="full" mb={5} alignItems="flex-start">
              <Text color="gray.600" fontWeight="bold" mb={3}>Meios de pagamento aceitos</Text>
              <Controller 
                name='payment_methods'
                control={control}
                render={({field: {onChange, value}}) => (
                  <Checkbox.Group 
                    value={value}
                    onChange={onChange}
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
                      Depósito
                    </Checkbox>
                  </Checkbox.Group>
                )}
              />
            </VStack>

            
          </BottomSheetScrollView>
          <HStack 
            flex={1} 
            justifyContent="center" 
            px={6} 
            maxH={20}
          >
              <Button 
                title='Resetar filtros' 
                mr={3} 
                onPress={handleResetFilters}
              />
              <Button 
                title='Aplicar filtos' 
                variant="black" 
                onPress={handleSubmit(handleApplyFilters)}
              />
          </HStack>
        </BottomSheetModal>
  );
});

LogBox.ignoreLogs([
  'We can not support a function callback. See Github Issues for details https://github.com/adobe/react-spectrum/issues/2320',
  'WARN: A component changed from uncontrolled to controlled.'

]);