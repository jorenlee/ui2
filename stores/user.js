import { defineStore } from 'pinia'

export const useUserStore = defineStore({
    id: 'user',
    state: () => ({
        user: {
            isAuthenticated: false,
            email: null,
            token: null,
            developerEmail: 'jorenleeluna24@gmail.com',
            testEmail: 'npc@lsu.edu.ph',
            registrarEmail: 'registrar@lsu.edu.ph'
        },
        // mainDevServer: 'http://167.172.70.88:8000/buang_ka_eyy',
        // mainDevServer: 'http://127.0.0.1:8000',
        mainDevServer: 'https://apipdp.lsu.edu.ph/buang_ka_eyy',
    }),

    actions: {
        initStore() {
            this.user.isAuthenticated = false
            if (localStorage.getItem('user.token')) {
                this.user.token = localStorage.getItem('user.token')
                this.user.email = localStorage.getItem('user.email')
                this.user.isAuthenticated = true
                // console.log('Initalized user:', this.user)
            }
        },
        setToken(token, email) {
            // console.log('setToken', token, email)

            this.user.token = token
            this.user.email = email
            this.user.isAuthenticated = true

            localStorage.setItem('user.token', token)
            localStorage.setItem('user.email', email)
        },
        removeToken() {
            // console.log('removeToken')

            this.user.token = null
            this.user.email = null
            this.user.isAuthenticated = false

            localStorage.setItem('user.token', '')
            localStorage.setItem('user.email', '')
        }
    }
})