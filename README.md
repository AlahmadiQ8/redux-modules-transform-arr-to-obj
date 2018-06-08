code shift for redux-modules old argument for `createModule` to the new one. 

```
transformations: [
  { type: 'init', reducer: state => state },
  { type: 'add', reducer: state => state + 1 },
]
```

to 

```
transformations: {
  init: { reducer: state => state },
  add: { reducer: state => state + 1},
}
```


## Running: 

- first install jscodeshift
  - `yarn global add jscodeshift`
- clone this repo
- go to your repository that you want to apply the codeshift and run the following: 
  - `jscodeshift -t <PATH_TO_CLONED_REPO>/redux-modules-new-transforms-shape.js src/`
