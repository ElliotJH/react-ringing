default: deploy

dist/bundle.js: jssrc/*.jsx
	yarn run webpack

deploy: dist/bundle.js index.html styles.css
	gsutil -h "Cache-Control:public, max-age=60, must-revalidate" cp dist/bundle.js gs://ringing-methods.resborand.co.uk/dist/bundle.js
	gsutil -h "Cache-Control:public, max-age=60, must-revalidate" cp index.html gs://ringing-methods.resborand.co.uk/index.html
	gsutil -h "Cache-Control:public, max-age=60, must-revalidate" cp styles.css gs://ringing-methods.resborand.co.uk/styles.css
