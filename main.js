const app = Vue.createApp({
  beforeCreate(){
    this.$store.dispatch('initialize');
  },
})
