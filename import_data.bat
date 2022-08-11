start /min cmd /c mongod --dbpath="c:\data\db"
mongoimport --db online-video-game-store --collection developers --file developers.json --jsonArray --mode=upsert
mongoimport --db online-video-game-store --collection customers --file customers.json --jsonArray --mode=upsert
taskkill /F /IM mongod.exe