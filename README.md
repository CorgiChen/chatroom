# Software Studio 2025 Spring
## Midterm Project Chatroom by 111034011 陳奕宏


### **如何本地運行（Setup locally）**

1. `cd <專案資料夾>`
2. `npm install`
3. `npm start`  
   預設在 [http://localhost:3000](http://localhost:3000) 開啟

### **Demo 網址**

- [Firebase Hosting 連結](https://ss-chatroom-111034011.web.app/)

--- 
| **Basic components**         | **Score** | **Check** |
| :--------------------------- | :-------: | :-------: |
| Membership Mechanism         |   5%      |     Y     |
| Firebase Hosting             |   5%      |     Y     |
| Database read/write          |   15%     |     Y     |
| RWD                          |   15%     |     Y     |
| Git                          |   5%      |     Y     |
| Chatroom  private/group      |   20%     |     Y     |

# Basic components

## Basic: Git 截圖
![image](https://hackmd.io/_uploads/HkmMaZ2yge.png)

## Basic: Database Read/Write
![image](https://hackmd.io/_uploads/HJYe0W31gx.png)

---

| **Advanced components**      | **Score** | **Check** |
| :--------------------------- | :-------: | :-------: |
| Using React                  |   10%     |     Y     |
| Google/Third-party Sign In   |   1%      |     Y     |
| Chrome notification          |   5%      |     Y     |
| CSS animation                |   2%      |     Y     |
| Handle code injection        |   2%      |     Y     |

## Advanced: Using React
- 整個專題都是用 React 框架開發的

## Advanced: Chrome notification
- 只要畫面不在聊天室，其他人傳訊息就可以收到

## Advanced: Third Party Sign In
![image](https://hackmd.io/_uploads/ryJh1M2yex.png)

## Advanced: CSS animation
- 點擊成員列表
- \>> 點擊任意成員
- \>> 點擊小卡
- \>> 華麗卡片旋轉動畫

## Advanced: Handle Code Injection
- React 只要不使用 DangerouslysetInnerHtml 就不會汙染程式碼

---

| **Bonus components**         | **Score** | **Check** |
| :--------------------------- | :-------: | :-------: |
| User profile                 |   1%      |     Y     |
| Profile picture              |   1%      |     X     |
| Send image                   |   1%      |     X     |
| Send video                   |   1%      |     X     |
| Chatbot (AI)                 |   2%      |     Y     |
| Block User                   |   2%      |     X     |
| Unsend message               |   3%      |     Y     |
| Search for message           |   3%      |     Y     |
| Send gif from Tenor API      |   3%      |     X     |


## Bonus: User profile
    - 點擊那個編輯的按鈕就會進到下方的頁面
![image](https://hackmd.io/_uploads/r1xheGhyex.png)
![image](https://hackmd.io/_uploads/r18ief3Jge.png)

## Bonus: Chatbot (AI) 
![image](https://hackmd.io/_uploads/r1_UQGn1eg.png)

## Bonus: Unsend message 
    - 電腦版：在訊息上方就會出現；手機版：點擊一下訊息出現
![image](https://hackmd.io/_uploads/SyfsWf3Jll.png)

## Bonus: Search for message
    - 聊天室的最上面
![image](https://hackmd.io/_uploads/HJmzzfhkel.png)


---

### **Sidebar（側邊欄）**
- **登出按鈕**：點擊可立即登出帳號。
- **個人小卡**：顯示你的大頭貼、暱稱、ID，可點擊編輯個人資料。
    - 典籍後跳轉到編輯頁面。 
- **公開聊天室**：進入所有人都能聊天的公開頻道。
- **建立聊天室**：可建立私人群組聊天室。
- **AI 聊天室**：與 CORGI AI 對話。
    - 一天僅能對話 15 次
- **聊天室清單**：顯示你加入的所有聊天室，點擊可切換。

### **主畫面**
- **訊息列表**：顯示所有訊息，支援訊息搜尋、收回（unsend）。
- **訊息輸入區**：可輸入訊息並發送，支援快捷鍵 Enter 發送。
- **AI 聊天室**：可輸入問題與 AI 對話，支援 /vip、/clear、/help 指令。

### **MemberList（成員列表）**
- 可以透過ID新增成員到私人聊天室
- 顯示聊天室所有成員，可點擊查看成員資訊。

---

## **功能說明與操作**

1. **註冊/登入**  
   - 支援 Email 註冊/登入與 Google 登入。
2. **聊天室管理**  
   - 可建立私人群組聊天室，並邀請其他用戶加入。
3. **訊息功能**  
   - 支援訊息搜尋、收回、惡意訊息過濾（防止 script/h1 等）。
4. **AI 聊天室**  
   - 與 CORGI AI 對話，並有 /vip、/clear、/help 指令。
5. **RWD 響應式設計**  
   - 手機、平板、桌機皆可正常使用。
6. **Chrome 通知**  
   - 新訊息時會推播通知（需允許權限）。
7. **CSS 動畫**  
   - 按鈕 hover、AI 聊天室按鈕有白光閃過動畫、用戶檔案小卡。

---

## **Bonus 功能說明**

- **User profile**：可編輯個人資料（暱稱、Email、電話、地址）。
- **Chatbot (AI)**：AI 聊天室。
    - /vip 開通當天對話無限次數
    - /clear 清空 AI 聊天室
    - /help 介紹指令
- **Unsend message**：可收回自己發送的訊息。
- **Search for message**：可搜尋聊天室訊息內容。