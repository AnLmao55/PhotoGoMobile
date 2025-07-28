import * as SecureStore from 'expo-secure-store';

export const SercuseService = {
    get: async (key: any) => {
        let result = await SecureStore.getItemAsync(key);
        return result
    },
    set: async (key: any, value: any) => {
        await SecureStore.setItemAsync(key, value);
    },
    remove: async (key: any) => {
        await SecureStore.deleteItemAsync(key);
    },
}