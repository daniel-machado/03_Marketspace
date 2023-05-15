import AsyncStorage from "@react-native-async-storage/async-storage";
import { AUTH_TOKEN_STORAGE } from "./storageConfig";

export async function storageAuthTokenSave(token: string) {
  await AsyncStorage.setItem(AUTH_TOKEN_STORAGE, token);
}

export async function storageAuthTokenGet() {
  const token = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE);

  return token
}

export async function storageAuthTokenRemove() {
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE);
}

{/*import AsyncStorage from '@react-native-async-storage/async-storage';

import { AUTH_STORAGE } from '@storage/storageConfig';

type StorageAuthTokenProps = {
  token: string;
  refresh_token: string;
}

//Salva o token no storage do dispositivo
export async function storageAuthTokenSave({
  token, 
  refresh_token}: StorageAuthTokenProps) {
  await AsyncStorage.setItem(
    AUTH_STORAGE, 
    JSON.stringify({ token, refresh_token }));
}

// Obtém o token do storage do dispositivo
export async function storageAuthTokenGet() {
  const response = await AsyncStorage.getItem(AUTH_STORAGE);

  const { token, refresh_token }: StorageAuthTokenProps = response 
  ? JSON.parse(response)
  : {}

  return { token, refresh_token };
}

// Remove o token do storage do dispositivo
export async function storageAuthTokenRemove() {
  await AsyncStorage.removeItem(AUTH_STORAGE);
}
*/}