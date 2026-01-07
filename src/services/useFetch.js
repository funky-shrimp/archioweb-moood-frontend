import { ref } from 'vue'
import axios from 'axios'
import { API_URL } from './api'
export function useFetch() {
    const data = ref(null)
    const loading = ref(false)
    const error = ref(null)

    const fetchData = async (url, options = {}) => {
        loading.value = true
        error.value = null
        
        try {
            console.log(url);
            
            const response = await axios(API_URL+url, options)
            data.value = response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Une erreur est survenue'
            console.error('API Error:', err)
        } finally {
            loading.value = false
        }

        return { data, error }
    }

    const postData = async (url, payload, options = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const response = await axios.post(API_URL + url, payload, options)
            data.value = response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi des données'
            console.error('API Post Error:', err)
        } finally {
            loading.value = false
        }

        return { data, error }
    }

    const putData = async (url, payload, options = {}) => {
        loading.value = true
        error.value = null
        
        try {
            const response = await axios.put(API_URL + url, payload, options)
            data.value = response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour des données'
            console.error('API Put Error:', err)
        } finally {
            loading.value = false
        }

        return { data, error }
    }

    return {
        data,
        loading,
        error,
        fetchData,
        postData,
        putData
    }
}