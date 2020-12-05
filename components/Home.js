app.component('Home', {
  template: /*html*/`
  <div class="home">
    <the-navbar :title="title"></the-navbar>

    <main>
      <div class="panel">
        <div class="panel-inner">
          <template v-if="firstSearch">
            <img class="panel-empty-image" :src="firstSearchImagePath"/>
            <span class="panel-empty-text">{{ firstSearchMessage }}</span>
          </template>
          <template v-else>
          <slider :elements="sliderList" v-slot="{ element, visibility }">
            <info-card class="slider-element"
            :class="visibility"
            :key="element"
            :id="element.cnpjNumber"
            :name="element.name"
            :cnpj="element.cnpj"
            :address="element.address"
            @click="openMap(element.cnpj)"
            />
          </slider>
          </template>
        </div>
      </div>
    </main>

    <footer class="footer"></footer>
  </div>`,
  data() {
    return {
      title: 'Localizador de Empresas',
      firstSearchImagePath: '/assets/images/search_image.png',
      firstSearchMessage: 'Localize acima a primeira empresa',
    }
  },
  computed: {
    ...Vuex.mapState([
      'companies',
      'sliderList'
    ]),
    firstSearch() {
      return this.companies.length === 0;
    }
  },
  methods: {
    openMap(cnpj) {
      this.$store.dispatch('selectCompany', cnpj);
      this.$router.push('/location');
    }
  },
})