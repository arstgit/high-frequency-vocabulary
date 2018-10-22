About This Repo
===============

This repo contains a list of the 30,000 most common English words in order of frequency, derived from [Peter Norvig's](http://norvig.com/ngrams/) compilation of the [1/3 million most frequent English words](http://norvig.com/ngrams/count_1w.txt).

I added **dictionary explanation**(resources from [youdao](http://ai.youdao.com/docs/doc-trans-api.s#p01)) for every word in the list.

Generate the translated list by yourself
-----

1. Register on [youdao](http://ai.youdao.com/product-fanyi.s), then apply for a appKey and secret.

2. Modify the value of appKey and secret variables in the index.js: 

```
  const appKey = 'example-Key' 
  const secret = 'example-secret'
```

3. (Optional) Modify the function, processDataCb, to get whatever you want from youdao's response. (The `phonetic` and `explains` fields are selected by default)

4. Run:

```
  cat 30k.txt | node index.js | tee result.txt
```

Enjoy!
