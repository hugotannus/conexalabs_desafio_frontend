const store = Vuex.createStore({
  state() {
    return {
      companies: [],
      currentCompany: {},
      info: {
        status: false,
        message: '',
      },
      sliderList: [],
      viewportWidth: window.innerWidth,
    }
  },

  getters: {
    allCompanies:   (state) => state.companies,
    company:  (state, cnpj) => state.companies.find(company => company.cnpj === cnpj),
    companiesCount: (state) => state.companies.length,
    sliderListSize: (state) => state.sliderList.length,
    infoStatus:     (state) => state.info && state.info.status,
    infoMessage:    (state) => state.info && state.info.message,
  },

  actions: {
    initialize({ commit, state }) {
      commit('initializeStore');

      if(state.companies.length) {
        commit('generateSliderList');
      }
    },

    handleSearch({ commit, state }, keyword) {
      commit('clearInfoMessage');

      try {
        if(keyword === null || keyword.length === 0) {
          throw {
            status: 'INFO',
            message: 'Digite um CNPJ para buscar sua localização.'
          }
        }

        var onlyDigits = keyword.match(/\d+/g);

        if(onlyDigits === null) {
          throw {
            status: 'ERROR',
            message: 'Essa busca considera apenas números/dígitos, filtrando quaisquer outros caracteres digitados.'
          }
        }

        onlyDigits = onlyDigits.join('');

        if(onlyDigits.length > 15 || onlyDigits.length < 13) {
          throw {
            status: 'ERROR',
            message: 'A quantidade de dígitos informada não corresponde a um número de CNPJ válido.'
          };
        }

        if(state.companies.find( ({ cnpj }) => cnpj === keyword)) {
          commit('updateSliderPosition', keyword);
        } else {
          axios.get(`https://www.receitaws.com.br/v1/cnpj/${onlyDigits}`)
          .then(response => {

            if(response.data.status === 'ERROR') {
              throw {
                message: `${response.data.message} ou não encontrado.`,
                status: 'NOTFOUND'
              }
            }

            return commit('addCompany', response.data)
          });
        }
      } catch(e) {
        commit('setInfoMessage', {
          status: e.status || 'ERROR',
          message: e.message || 'Não foi possível realizar sua busca!'
        });
      }
    },

    selectCompany({ commit }, cnpj) {
      commit('setCurrentCompany', cnpj);
      commit('clearInfoMessage');
    },
  },

  mutations: {
    initializeStore(state) {
      var sampleData = [
        {
          id: "1234",
          name: "Conexa Hub de Inovação",
          cnpj: "342.454.0001-75",
          cnpjNumber: "342454000175",
          endereco: {
            logradouro: "Av Brasil",
            numero: "2233",
            bairro: "Centro",
            municipio: "Goiânia",
            uf: "GO",
            cep: ''
          },
          address: "Av Brasil, 2233, Centro, Goiânia-GO",
        },
        {
          id: "5678",
          name: "Conexa Hub de Inovação",
          cnpj: "342.454.0001-76",
          cnpjNumber: "342454000176",
          endereco: {
            logradouro: "Av Caiapó",
            numero: "",
            bairro: "",
            municipio: "Goiânia",
            uf: "GO",
            cep: ''
          },
          address: "Av Caiapó, Goiânia-GO",
        },
      ];

      const companies       = localStorage.getItem('companies');
      const currentCompany  = localStorage.getItem('currentCompany');

      state.companies = companies ? JSON.parse(companies) : sampleData;
      state.currentCompany = currentCompany ? JSON.parse(currentCompany) : sampleData[0];
      // state.companies = companies ? JSON.parse(companies) : [];
      // state.currentCompany = currentCompany ? JSON.parse(currentCompany) : {};
    },

    generateSliderList(state) {
      var vw = state.viewportWidth;         // TO-DO: find properly way to get an viewport value;
      var elWidth = 260;                  // TO-DO: find properly way to get an element attribute;

      var threshold = Math.round( (vw - 100) / elWidth );
      var elements = [];

      if(state.companies.length > 0) {
        do {
          elements = elements.concat([...state.companies]);
        } while(elements.length < threshold + 2);
      }

      state.sliderList = elements.map(e => e = {...e});
    },

    clearInfoMessage(state) {
      state.info.status = false;
      state.info.message = '';
    },

    addCompany(state, data) {
      try {
        const { nome, cnpj, logradouro, numero, bairro, municipio, uf } = data;
        const company = {
          cnpj,
          cnpjNumber: cnpj.match(/\d+/g).join(''),
          name: nome.split(' ').map(e => _.upperFirst(e.toLowerCase())).join(' '),
          address: [
            logradouro,
            numero,
            bairro,
            municipio,
          ].map( function(element) {
            let arr = element.split(' ');
            return arr.map(e => _.upperFirst(e.toLowerCase())).join(' ');
          }).join(', ').concat('-', uf),
        }

        store.commit('updateSliderList', company);
        state.companies.push(company);
        state.currentCompany = company;
        localStorage.setItem('companies', JSON.stringify(state.companies));
        localStorage.setItem('currentCompany', JSON.stringify(state.currentCompany));
      } catch (e) {
        commit('setInfoMessage', {
          status: e.status || 'ERROR',
          message: e.message || 'Erro ao adicionar empresa encontrada.'
        });
      }
    },

    setCurrentCompany(state, cnpj) {
      try {
        state.currentCompany = state.companies.find(company => company.cnpj === cnpj);
        localStorage.setItem('currentCompany', JSON.stringify(state.currentCompany));
      } catch(e) {
        commit('setInfoMessage', {
          status: e.status || 'ERROR',
          message: e.message || 'Erro inexperado: não foi possível selecionar empresa.'
        });
      }
    },

    setInfoMessage(state, data) {
      state.info.status = data.status;
      state.info.message = data.message;
    },

    rotateListLeft(state) {
      state.sliderList.push(state.sliderList.shift());
    },

    rotateListRight(state) {
      state.sliderList.unshift(state.sliderList.pop());
    },

    shuffle(state) {
      state.sliderList = _.shuffle(state.sliderList);
    },

    updateSliderList(state, element) {
      const N = state.companies.length;
      const L = state.sliderList.length;

      for(let i = L-1; i > 0; i -= N) {
        state.sliderList.splice(i, 0, {...element});
      }
    },

    updateSliderPosition(state, cnpj) {
      const middle = state.sliderList.length / 2;

      while(state.sliderList[middle].cnpj != cnpj) {
        store.commit('rotateListLeft');
      }
    }
  }
})