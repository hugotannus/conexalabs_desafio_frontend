const app = Vue.createApp({
  beforeCreate(){
    this.$store.commit('initializeStore');
  },
  created() {
    this.$store.commit('generateSliderList');
  }
})
