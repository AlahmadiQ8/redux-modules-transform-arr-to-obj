const foo = () => {
  console.log('omg')
}

const { name, actions, reducer, constants, selector } = createModule({
  name: 'budget',
  initialState: fromJS({
    params: {
      size: 10000,
      page: 0,
      groupBy: DEFAULT_GROUPING,
    },
    _loading: false,
  }),
  selector: budgetModuleSelector,
  transformations: {
    groupByInit: {
      reducer: setParamsGroupByReducer,
    },

    fetch: {
      middleware: [
        middleware.propCheck({
          id: oneOfType([string, number]),
        }),
      ],

      reducer: (state, { payload: { id } }) => {
        return state.update(id, Map(), budget => budget.set('_loading', true))
      },
    },

    setAggregates: {
      middleware: [
        middleware.propCheck({
          id: oneOfType([string, number]).isRequired,
          aggregateData: object.isRequired,
        }),
      ],

      reducer: (state, { payload: { id, aggregateData } }) =>
        state.update(id, Map(), budget =>
          budget.set('aggregateData', fromJS(aggregateData))
        ),
    },

    fetchSuccess: {
      middleware: [
        middleware.propCheck({
          id: oneOfType([string, number]),
          data: shape({
            groups: object,
            page: object.isRequired,
            data: array.isRequired,
          }).isRequired,
        }),
      ],

      reducer: (state, { payload: { id, data } }) => {
        const groupedData = groupData(
          budgetGrouping,
          data.groups.group_order,
          data.data,
          data.groups.data
        )

        return state.update(id, Map(), budget =>
          budget
            .set('data', fromJS(data.data))
            .set('groups', fromJS(data.groups))
            .set('groupedData', fromJS(groupedData))
            .set('page', fromJS(data.page))
            .set('groupOrder', fromJS(data.groups.group_order))
            .set('_loading', false)
        )
      },
    },

    fetchError: {
      middleware: [
        middleware.propCheck({
          error: object,
          id: oneOfType([string, number]).isRequired,
        }),
      ],

      reducer: (state, { payload: { error, id } }) => {
        return state.update(id, Map(), budget =>
          budget.set('_errors', error).set('_loading', false)
        )
      },
    },

    setParamsCurrentPage: {
      reducer: (state, { payload }) =>
        state.update('params', params => params.set('page', payload)),
    },

    setParamsExpandAll: {
      reducer: setParamsExpandAllReducer,
    },

    expandAllInit: {
      reducer: setParamsExpandAllReducer,
    },

    setParamsGroupBy: {
      reducer: setParamsGroupByReducer,
    },

    filterInit: {
      middleware: [setParamsFilterPropCheck],
      reducer: setParamsFilterReducer,
    },

    setParamsFilter: {
      middleware: [setParamsFilterPropCheck],
      reducer: setParamsFilterReducer,
    },

    removeParamsFilter: {
      middleware: [
        middleware.propCheck({
          filter: shape({
            name: string.isRequired,
          }),
        }),
      ],

      reducer: (state, { payload: { filter } }) =>
        state.update('params', Map(), params =>
          setPage(params.deleteIn(['filters', filter.name]), 0)
        ),
    },

    resetParamsFilter: {
      reducer: resetParamsFilterReducer,
    },

    resetParamsFilterForSave: {
      reducer: resetParamsFilterReducer,
    },

    setInitialParams: {
      reducer: (state, { payload }) => {
        return state.set('params', fromJS(payload))
      },
    },
  },
})
