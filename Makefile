.DUMMY: default deploy deploy_firebase

PUBLIC_DIR := firebase/public
DIST_DIR := $(PUBLIC_DIR)/dist

default: deploy

dist/bundle.js: jssrc/*.jsx
	yarn run webpack

$(PUBLIC_DIR):
	mkdir $@

$(PUBLIC_DIR)/%.html: %.html firebase
	cp $< $@

$(PUBLIC_DIR)/%.css: %.css firebase
	cp $< $@

$(DIST_DIR):
	mkdir -p $@

$(DIST_DIR)/%: dist/% $(DIST_DIR)
	cp $< $@

deploy_firebase: $(PUBLIC_DIR)/index.html $(PUBLIC_DIR)/styles.css $(DIST_DIR)/bundle.js
	cd ./firebase && firebase deploy

deploy: dist/bundle.js index.html styles.css
	gsutil -h "Cache-Control:public, max-age=60, must-revalidate" cp dist/bundle.js gs://ringing-methods.resborand.co.uk/dist/bundle.js
	gsutil -h "Cache-Control:public, max-age=60, must-revalidate" cp index.html gs://ringing-methods.resborand.co.uk/index.html
	gsutil -h "Cache-Control:public, max-age=60, must-revalidate" cp styles.css gs://ringing-methods.resborand.co.uk/styles.css
