const store = Vuex.createStore({
  state() {
    return {
      companies: [],
      currentCompany: {},
      info: {
        status: false,
        message: '',
        lastSearched: undefined,
      },
      validCnpjNumber: undefined,
      viewportWidth: window.innerWidth,
    }
  },

  getters: {
    allCompanies:   (state) => state.companies,
    currentCompany: (state) => state.currentCompany,
    infoStatus:     (state) => state.info && state.info.status,
    infoMessage:    (state) => state.info && state.info.message,
    lastSearched:   (state) => state.info && state.info.lastSearched,
    viewportWidth:  (state) => state.viewportWidth,
  },

  actions: {
    initialize({ commit }) {
      commit('initializeStore');
    },

    handleSearch({ commit, state }, keyword) {
      commit('clearInfoData');

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

        commit('validateCnpj', parseInt(onlyDigits.join('')));

        if(!state.validCnpjNumber) {
          throw {
            status: 'ERROR',
            message: 'O número informado não é um CNPJ válido.'
          };
        }

        // '==' intentionally preferred over the '==='
        var cachedCompany = state.companies.find( ({ cnpjNumber }) => cnpjNumber == state.validCnpjNumber);

        if(cachedCompany) {
          commit('setCurrentCompany', cachedCompany);
        } else {
          axios.get(`https://cors-anywhere.herokuapp.com/https://www.receitaws.com.br/v1/cnpj/${state.validCnpjNumber}`)
          .then((response) => {

            if(response.data.status === 'ERROR') {
              throw {
                message: `${response.data.message} ou não encontrado.`,
                status: 'NOTFOUND'
              }
            }

            return commit('addCompany', response.data);
          }).catch((error) => {
            commit('setInfoMessage', {
              status: 'ERROR',
              message: `Erro de requisição: ${error.message}`
            });
            console.error(error);
          });
        }
      } catch(e) {
        commit('setInfoMessage', {
          status: e.status || 'ERROR',
          message: e.message || 'Não foi possível realizar sua busca!'
        });
      } finally {
        state.validCnpjNumber = undefined;
      }
    },

    selectCompany({ commit, state }, selectedCnpj) {
      var company = state.companies.find( ({ cnpj }) => cnpj === selectedCnpj);

      commit('setCurrentCompany', company);
      commit('clearInfoData');
    },

    updateViewportWidth({ commit }, width) {
      commit('updateViewportWidth', width);
    },
  },

  mutations: {
    initializeStore(state) {
      const companies       = localStorage.getItem('companies');
      const currentCompany  = localStorage.getItem('currentCompany');

      state.companies = companies ? JSON.parse(companies) : [];
      state.currentCompany = currentCompany ? JSON.parse(currentCompany) : {};
    },

    clearInfoData(state) {
      state.info.status = false;
      state.info.message = '';
      state.info.lastSearched = undefined;
    },

    addCompany(state, data) {
      try {
        const { nome, cnpj, logradouro, numero, bairro, municipio, uf } = data;
        const company = {
          cnpj,
          cnpjNumber: parseInt(cnpj.match(/\d+/g).join('')),
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

        state.currentCompany = company;
        state.companies = [...state.companies, company];
        state.info.lastSearched = company.cnpj;
        localStorage.setItem('companies', JSON.stringify(state.companies));
        localStorage.setItem('currentCompany', JSON.stringify(state.currentCompany));
      } catch (e) {
        commit('setInfoMessage', {
          status: e.status || 'ERROR',
          message: e.message || 'Erro ao adicionar empresa encontrada.'
        });
      }
    },

    setCurrentCompany(state, company) {
      try {
        state.currentCompany = {...company};
        state.info.lastSearched = company.cnpj;
        localStorage.setItem('currentCompany', JSON.stringify(company));
      } catch(e) {
        commit('setInfoMessage', {
          status: e.status || 'ERROR',
          message: e.message || 'Erro inesperado: não foi possível selecionar empresa.'
        });
      }
    },

    setInfoMessage(state, data) {
      state.info.status = data.status;
      state.info.message = data.message;
    },

    updateViewportWidth(state, width) {
      state.viewportWidth = width;
    },

    validateCnpj(state, cnpj) {
      var partial = Math.floor(cnpj / 100);

      var dv1 = calculateDigit(partial);
      var dv2 = calculateDigit(partial * 10 + dv1);
      var number = partial * 100 + dv1 * 10 + dv2;

      // '==' intentionally preferred over the '==='
      state.validCnpjNumber = number > 0 && number == cnpj && cnpj;

      function calculateDigit(partial) {
        var acc = 0;

        while(partial) {
          for(var i=2; i<=9; i++) {
            acc += (partial % 10) * i;
            partial = Math.floor(partial / 10);
          }
        } acc %= 11;

        return (acc < 2) ? 0 : 11 - acc;
      }
    }
  }
})