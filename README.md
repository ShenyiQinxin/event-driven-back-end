
### This is a service for twitter streaming and fetch tweets
:relaxed:
### Encryption:
https://github.com/AGWA/git-crypt is used and following tutorial 
https://dev.to/heroku/how-to-manage-your-secrets-with-git-crypt-56ih
```sh
brew install git-crypt
git-crypt init

git-crypt export-key ../git-crypt-key
# Alternatively
cp .git/git-crypt/keys/default ../git-crypt-key
echo "[file to encrypt] filter=git-crypt diff=git-crypt" > .gitattribute

# To reuse the git-crypt-key
git add <file>
git commit -m 'commit msg'
git-crypt unlock git-crypt-key

```
