import AsyncStorage from "@react-native-async-storage/async-storage";

import { UserDTO } from '@dtos/UserDTO';
import { USER_STORAGE } from '@storage/storageConfig';

//Salvar Usuário no async Storage
export async function storageUserSave(user: UserDTO){
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user))
}

//Verifica se tem usuário no storage e obtém o user.
export async function storageUserGet() {
  const storage = await AsyncStorage.getItem(USER_STORAGE);
  const user: UserDTO = storage ? JSON.parse(storage) : {};
  return user
}

// Desloga o usuário e remove do async Storage
export async function storageUserRemove() {
  await AsyncStorage.removeItem(USER_STORAGE);
}