Ding - "Соцсеть" для кукол 
====

Имитация соцсети для видео на моём канале

Как запустить у себя?
---
1. Перед запуском убедитесь, что у Вас установлен Docker. [Скачать Docker](https://www.docker.com/products/)
2. Затем запустите файл compose.yml, который находится в корне этого проекта. Это делается следующим образом: 
`docker compose -f 'compose.yml' up -d --build `   
**Важно!** Для того чтобы команда сработала, нужно, чтобы Docker был запущен (во всяком случае, на Windows 10)  
Кстати, в VS Code есть специальное расширение, добавляющее кнопки запуска сервисом прямо в файл! [Скачать расширение](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-containers)
3. *Дополнительно*: Вы можете импортировать базу данных, чтобы не заполнять всё с нуля. Для этого скачайте файл (ссылка ниже) и наберите в терминале команду: 
`docker exec -i postgres psql -U postgres -d postgres < backup.sql`  
[Скачать базу данных](https://drive.google.com/file/d/1vTBPpcIXkLXHArnZx_4-6RD1fbPRpqfZ/view?usp=sharing)  
Для корректной работы с ней также понадобится скачать два SWF-файла.  
[Папка с SWF-файлами](https://drive.google.com/drive/folders/1Fy8oLOjPqDZbtP7hQwr7_eSs4qV5W2cX?usp=drive_link)

Контактная информация
---
По вопросам и пожеланиям пишите на почту [ellaksenofontova@gmail.com](mailto:ellaksenofontova@gmail.com)