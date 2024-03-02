# Blog

- Cloudflare Pages, MongoDB Atlas, Next.js, React, Redux를 이용한 블로그입니다. 해당 자료는 웹서핑 및 GPT4를 참조해서 만들었습니다.

## 목차

- 목차가 들어갈 부분입니다!!

## 프로젝트 환경 설정

1. **Next.js 프로젝트 생성하기**

```bash
npx create-next-app@latest
```

2. **필요한 패키지 설치하기**

```bash
npm install redux react-redux next-redux-wrapper
npm install mongodb
```

3. **MongoDB Atlas 설정하기**

   > 1. MongoDB Atlas 웹사이트에서 계정을 생성.
   > 2. 새 클러스터(Cluster)를 생성.
   > 3. 데이터베이스 사용자를 생성하고, 이 사용자에게 데이터베이스에 접근할 수 있는 권한을 부여.
   > 4. 네트워크 접근(Network Access) 설정에서 IP 주소를 추가하여 데이터베이스에 접근할 수 있도록 함.
   > 5. Connect 버튼을 클릭하여 연결 메소드를 선택하고, 애플리케이션 코드에서 사용할 연결 문자열을 얻음.

4. **환경 변수 설정하가**

```env
MONGODB_URI=your_mongodb_uri
MONGODB_DB=your_database_name
```

5. **'lib/mongodb.js'에 MongoDB와의 연결 코드 작성하기**

```javascript
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

6. **Cloudflare Pages 설정하기**

   > 1. Cloudflare Pages 대시보드에서 "Create a project"를 선택.
   > 2. 프로젝트를 호스팅할 Git 리포지토리를 연결.
   > 3. 빌드 설정을 구성합니다. Next.js 프로젝트의 경우, 빌드 명령어는 npm run build이고, 빌드 출력 디렉토리는 out임.

7. **개발 시작하기**

```bash
npm run dev
```

## 프로젝트 기본 구조

- **layout.tsx**: Next.js의 Root Layout을 정의하는 역할. Root Layout은 애플리케이션의 모든 페이지에 공통적으로 적용되는 최상위 레이아웃. 글로벌 CSS를 적용하고, 페이지의 기본 구조를 정의하는 역할을 함.
- **page.tsx**: 실제 페이지 컴포넌트를 정의함. 이 파일은 보통 페이지의 실제 내용을 렌더링하는 데 사용됨.
- **next.config.mjs**: Next.js 애플리케이션의 고급 설정을 정의하는 파일. 라우팅, 빌드 최적화, 환경 변수 등을 설정할 수 있음.
- **next-env.d.ts**: Next.js에서 TypeScript를 사용할 때 필요한 타입 정의를 포함.
- **postcss.config.js**: PostCSS를 사용하여 CSS를 변환하는 설정을 정의. 예를 들어, Tailwind CSS 같은 플러그인을 사용할 때 필요함.
- **tailwind.config.ts**: Tailwind CSS 설정 파일. Tailwind의 테마, 변형, 플러그인 등을 설정.
- **tsconfig.json**: TypeScript 컴파일러 옵션을 정의하는 파일. 프로젝트의 루트 레벨에서 TypeScript 설정을 관리함.

## MongoDB

- **개념**: MongoDB는 NoSQL 데이터베이스로, 문서 지향적(document-oriented) 데이터베이스.

- **데이터 구조**

  > - **데이터베이스(Database)**: MongoDB 인스턴스는 하나 이상의 데이터베이스를 포함할 수 있음. 각 데이터베이스는 독립된 파일 세트로 디스크에 저장되며, 서로 다른 데이터베이스 간의 데이터는 분리되어 있음. 데이터베이스는 여러 컬렉션을 포함할 수 있음.
  > - **컬렉션(Collection)**: 각 데이터베이스는 하나 이상의 컬렉션을 가질 수 있음. 컬렉션은 SQL 데이터베이스의 테이블과 비슷한 개념이지만, 스키마가 고정되어 있지 않습니다. 컬렉션 내의 문서는 서로 다른 구조를 가질 수 있으며, 이는 MongoDB의 유연성을 제공함.
  > - **문서(Document)**: 컬렉션은 개별 문서들로 구성됨. 문서는 BSON(Binary JSON) 형식으로 저장되며, JSON과 유사한 구조를 가지고 있음. 각 문서는 필드와 값의 쌍으로 구성되며, 문서는 유일한 \_id 필드를 가짐. 문서는 중첩된 문서(nested documents)와 배열을 포함할 수 있어, 복잡한 데이터 구조를 표현할 수 있음.

- **구조적 특징**

  > - **스키마 없음(No fixed schema)**: MongoDB의 컬렉션은 고정된 스키마를 갖지 않음. 이는 컬렉션 내의 각 문서가 서로 다른 구조를 가질 수 있음을 의미함. 이러한 특징은 데이터 구조가 시간에 따라 변할 수 있는 애플리케이션에 유연성을 제공함.
  > - **중첩 문서(Nested documents)와 배열**: 문서는 다른 문서를 포함하거나 배열을 포함할 수 있음. 이를 통해 관계형 데이터베이스에서 여러 테이블에 걸쳐 저장되는 데이터를 하나의 문서에 포함시켜 관리할 수 있음.
  > - **문서 지향적(Document-oriented)**: MongoDB는 문서를 데이터 저장의 기본 단위로 사용함. 이는 개발자가 애플리케이션에서 사용하는 객체나 데이터 구조를 데이터베이스에 직접 매핑할 수 있게 해, 데이터 모델링이 더 직관적이고 효율적이 됨.

- **collection 간의 관계 맺기**
  > - **참조(Reference)**: SQL의 외래키와 유사하게, 다른 컬렉션의 문서를 가리키는 방식. 이를 통해 관계를 맺으며, 일반적으로 \_id 필드를 사용하여 다른 컬렉션의 문서 ID를 저장. 참조는 정규화된 데이터 모델을 선호할 때 유용하며, 데이터 중복을 최소화하고 데이터 일관성을 유지하는 데 도움이 됨.

```javascript
// pages/api/posts.js
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

async function getPosts() {
  try {
    await client.connect();
    const database = client.db("blog");
    const posts = database.collection("posts");

    // posts 컬렉션에서 모든 포스트를 가져옴
    const postsData = await posts.find({}).toArray();

    // 각 포스트에 대해 userId를 사용하여 users 컬렉션에서 사용자 정보를 조회함
    const users = database.collection("users");
    const postsWithUser = await Promise.all(
      postsData.map(async (post) => {
        const user = await users.findOne({ _id: post.userId });
        return { ...post, user };
      })
    );

    return postsWithUser;
  } finally {
    await client.close();
  }
}
```

> - **내장(Embedded)**: 한 문서 내에 다른 문서를 직접 포함시키는 방식. 이 방법은 빠른 읽기 작업을 위해 최적화된 비정규화된 데이터 모델을 선호할 때 유용함. 내장 문서 방식은 관련 데이터를 한 번의 쿼리로 쉽게 가져올 수 있으며, 네트워크 비용이 감소하고, 쿼리 성능이 향상될 수 있음.

- **$lookup 연산자**
  MongoDB의 $lookup 연산자를 사용하는 집계 쿼리는 다른 컬렉션에서 문서를 "조인"하는 데 사용됩니다. 이를 통해 관련 데이터를 한 번의 쿼리로 함께 가져올 수 있으므로, N+1 문제를 해결할 수 있습니다. N+1 문제는 단일 쿼리(N)로 필요한 모든 정보를 가져오는 대신, 하나의 주 쿼리(1)와 그 결과로 반환된 각 항목(N)에 대해 추가 쿼리를 실행해야 하는 상황을 말합니다.

```javascript
// api/posts.js 또는 pages/api/posts.js 내에 위치할 수 있습니다.

import { MongoClient } from "mongodb";

async function getPostsAndUsers() {
  // MongoDB 클라이언트 생성 및 연결
  const uri = "your_mongodb_connection_string";
  const client = new MongoClient(uri);
  await client.connect();

  // 'posts' 컬렉션에서 집계 쿼리 실행
  const aggregation = [
    {
      $lookup: {
        from: "users", // '조인'할 컬렉션 이름
        localField: "userId", // 'posts' 컬렉션에서 매칭시킬 필드
        foreignField: "_id", // 'users' 컬렉션에서 매칭시킬 필드
        as: "userDetails", // 결과를 추가할 필드 이름
      },
    },
  ];

  const posts = await client
    .db("your_db_name")
    .collection("posts")
    .aggregate(aggregation)
    .toArray();

  // 연결 해제
  await client.close();

  return posts;
}

// API 또는 getServerSideProps/getStaticProps 내에서 이 함수를 사용할 수 있습니다.
```

## TypeScript

- **개념**: 타입스크립트는 자바스크립트(JavaScript)에 타입(type)을 추가한 언어. 자바스크립트는 동적 타입 언어로서, 변수의 타입이 실행 시점에 결정되며, 변경될 수 있음. 반면, 타입스크립트는 정적 타입 언어의 특성을 추가하여, 개발 시점에 변수의 타입을 지정해줌으로써 보다 안정적인 코드를 작성할 수 있도록 도움. 타입스크립트는 결국 자바스크립트로 컴파일되어 실행되므로, 모든 자바스크립트 코드는 유효한 타입스크립트 코드가 될 수 있음. 타입스크립트는 대규모 애플리케이션 개발에 적합하며, 개발자들이 더욱 안정적이고 관리하기 쉬운 코드를 작성할 수 있도록 도와줌.

- **특징**

1. **타입 주석(Type Annotations)**: 변수나 함수의 반환 값에 타입을 명시적으로 선언함. 이를 통해 컴파일 시 타입 체크를 할 수 있어, 오류를 미리 방지할 수 있음.

```javascript
let message: string = "Hello, TypeScript";
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

2. **인터페이스(Interfaces)**: 객체의 형태를 정의할 수 있는 방법으로, 타입 체킹을 위해 사용됨. 인터페이스를 통해 객체가 특정 구조를 충족하도록 강제할 수 있음.

```javascript
interface User {
  name: string;
  age: number;
}

function registerUser(user: User) {
  // ...
}
```

3.  **제네릭(Generics)**: 타입을 매개변수로 받아서 사용할 수 있는 기능으로, 다양한 타입에 대해 호환성을 유지하면서 코드를 재사용할 수 있게 함.

```javascript
function identity<T>(arg: T): T {
  return arg;
}
```

4. **유니언 타입(Union Types)과 인터섹션 타입(Intersection Types)**: 유니언 타입은 변수가 여러 타입 중 하나일 수 있음을 의미하고, 인터섹션 타입은 여러 타입을 모두 만족하는 타입을 의미함. 유니온 타입은 타입들을 |로 연결하여 사용.

```javascript
// 유니언 타입
function printId(id: number | string) {
  console.log(`Your ID is: ${id}`);
}

// 인터섹션 타입
interface BusinessPartner {
  name: string;
  credit: number;
}

interface Identity {
  id: number;
  email: string;
}

type Employee = BusinessPartner & Identity;
```

5. **옵셔널 체이닝(Optional Chaining)**: ?. 연산자를 사용하여 객체의 프로퍼티에 접근할 때 해당 객체나 프로퍼티가 null 또는 undefined일 경우에 에러를 발생시키지 않고 undefined를 반환하도록 할 수 있음.

```javascript
const email = profile?.email;
```

6. **널 병합 연산자 (Nullish Coalescing)**: ?? 연산자를 사용하여 왼쪽 피연산자가 null 또는 undefined일 경우 오른쪽 피연산자의 값을 사용할 수 있음.

```javascript
const email = profile?.email ?? "";
```

7. **타입 단언 (Type Assertions)**: 특정 값의 타입을 명시적으로 지정하고 싶을 때 사용. as 키워드를 사용.

```javascript
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;

```

- **js와의 차이점**

  > - **타입 시스템**: JS는 동적 타입 언어이고, TS는 정적 타입 언어. TS는 컴파일 시점에 타입 체크를 수행하여 오류를 사전에 발견할 수 있음.
  > - **개발 도구 지원**: TS는 코드를 작성하는 도중에도 에러를 감지하고 자동 완성, 인터페이스 및 타입 정보 제공 등 향상된 개발 경험을 제공함.
  > - **호환성**: TS는 JS의 상위 집합이므로, 모든 JS 코드는 TS에서도 작동합니다. TS를 사용하면 JS로 컴파일하여 실행할 수 있음.

- **사용 이유**
  > - **오류 감소**: 컴파일 시점에 타입 체크를 수행하여 런타임 오류를 줄일 수 있음.
  > - **코드 가독성 및 유지보수**: 프로젝트가 커질수록 타입 정보가 코드의 가독성과 유지보수성을 높여줌.
  > - **팀 개발**: 큰 규모의 프로젝트나 팀에서 작업할 때, 타입스크립트의 엄격한 타입 시스템은 개발자 간의 명확한 커뮤니케이션을 도와주고, 실수를 줄여줌.

## Next.js

### 명령어

- **dev**: next dev를 실행하여, 개발 모드에서 Next.js 서버를 시작함. 이 모드에서는 핫 리로딩이 활성화되어 있어, 코드 변경사항이 자동으로 반영되며, 개발 중인 애플리케이션을 쉽게 테스트할 수 있음.

- **build**: next build를 실행하여, 프로덕션을 위한 애플리케이션을 빌드함. 이 명령어는 애플리케이션을 최적화하고, 정적 파일들을 생성하는 과정을 포함함. 빌드 과정은 배포 전에 수행되어야 함.

- **start**: next start를 실행하여, 프로덕션 모드에서 Next.js 서버를 시작함. 이 명령어는 build 명령어로 생성된 빌드 결과물을 사용하여 서버를 실행. 개발 모드와 달리, 코드 변경에 대한 핫 리로딩은 지원되지 않음.

- **lint**: next lint를 실행하여, 프로젝트의 코드에 대한 린팅을 수행함. 이는 코드 품질과 일관성을 유지하기 위해 사용되며, 잠재적인 문제나 일반적인 코딩 규칙을 위반하는 부분을 식별할 수 있음.

### Pages Router vs App Router

- **pages 디렉토리 (Pages Router)**: 전통적인 Next.js 라우팅 방식을 사용. 파일 시스템 기반 라우팅을 제공하며, pages 디렉토리 내의 파일 구조가 URL 경로와 직접 매핑됨.
  예를 들어, pages/about.tsx 파일은 /about URL로 접근할 수 있는 페이지를 생성함. 각 페이지는 자체적으로 라우트 및 로직을 포함하고, 자동으로 코드 분할 및 서버 사이드 렌더링(SSR) 또는 정적 사이트 생성(SSG)을 지원함.

- **app 디렉토리 (App Router)**: Next.js 13 이상에서 도입된 새로운 라우팅 및 페이지 구성 방식. app 디렉토리는 더 세밀한 컨트롤을 위한 라우트 핸들링, 레이아웃, 공통 페이지 요소의 재사용성을 높이기 위해 설계됨. app 내에서는 페이지 구성 요소(layouts, error pages 등)를 포함하여 애플리케이션의 전반적인 구조를 정의할 수 있음. 파일 시스템 기반 라우팅 뿐만 아니라, 라우트 경로를 더 명확하게 커스터마이즈할 수 있으며, 페이지 간 상태 공유, 레이아웃 내에서 페이지 전환 제어 등 고급 기능을 사용할 수 있음.

### API Router 구성 방식

- **페이지 (Pages)**: pages 디렉토리 내의 파일들은 Next.js의 라우팅 시스템에 의해 자동으로 라우트로 변환됨. 예를 들어, pages/about.js 파일은 /about URL로 접근할 수 있는 페이지를 생성함. 이 페이지들은 서버 사이드 렌더링(SSR), 정적 사이트 생성(SSG), 클라이언트 사이드 렌더링(CSR) 등 다양한 렌더링 방식을 지원함.

- **API 라우트**: pages/api 디렉토리 내의 파일들은 API 엔드포인트로 작동함. 이는 서버리스 함수(serverless functions)로 배포되며, 주로 데이터를 조회하거나 수정하는 데 사용됨. 예를 들어, pages/api/hello.js 파일은 /api/hello URL로 접근할 수 있는 API 엔드포인트를 생성하며, 주로 JSON 형태의 데이터를 반환함.

### Next.js에서 링크 및 API 요청 처리하기

- 링크: Next.js에서는 페이지 간 이동을 위해 next/link 컴포넌트를 사용합니다. 이는 react-router-dom의 Link 컴포넌트와 유사합니다.

```javascript
// 예시: pages/index.js
import Link from "next/link";

const IndexPage = () => (
  <div>
    <Link href="/about">
      <a>About Us</a>
    </Link>
  </div>
);

export default IndexPage;
```

- API 요청 (GET, POST, PUT, DELETE): API 요청은 서버사이드에서 getServerSideProps 또는 getStaticProps를 사용하여 데이터를 미리 불러올 수 있습니다. 클라이언트사이드에서는 fetch API 또는 axios와 같은 라이브러리를 사용하여 API 요청을 처리합니다.

```javascript
// 클라이언트사이드에서 API 요청하기
const fetchData = async () => {
  const response = await fetch("/api/data", {
    method: "GET", // or 'POST', 'PUT', 'DELETE', etc.
    headers: {
      "Content-Type": "application/json",
    },
    // body: JSON.stringify(data), // if POST or PUT
  });
  const data = await response.json();
  return data;
};
```

- API 라우트: Next.js에서는 pages/api 디렉토리 내에 파일을 생성함으로써 API 라우트를 설정할 수 있습니다. 각 파일은 하나의 API 엔드포인트로 동작하며, 여기에 get, post, put, delete 등의 HTTP 메서드를 처리하는 로직을 작성할 수 있습니다.

```javascript
// 예시: pages/api/data.js
export default function handler(req, res) {
  const { method } = req;

  switch (method) {
    case "GET":
      // 데이터 가져오기 로직
      break;
    case "POST":
      // 데이터 생성 로직
      break;
    // 다른 HTTP 메서드도 처리 가능
  }
}
```

### Redux in Next.js

#### 아키텍처 흐름

1. **액션(Action)**: 상태 변화를 일으키기 위해 발송(dispatch)되는 객체. 각 액션은 type 속성을 가지며, 이는 처리할 액션의 종류를 나타냄.
2. **디스패처(Dispatcher)**: 액션을 스토어에 전달하는 역할을 함. dispatch 함수를 통해 이루어짐.
3. **리듀서(Reducer)**: 액션을 받아 이전 상태와 함께 로직을 처리한 후 새로운 상태를 반환함. 리듀서는 순수 함수여야 하며, 이전 상태를 변경하지 않고 새로운 상태 객체를 생성하여 반환해야 함.
4. **스토어(Store)**: 애플리케이션의 상태를 보관하는 컨테이너. 스토어는 애플리케이션의 상태와 리듀서를 연결하고, 상태 변화를 구독(subscribe)하는 기능을 제공함.
5. **뷰(View)**: 상태 변화에 반응하여 사용자 인터페이스를 업데이트. React와 Redux를 함께 사용할 때, useSelector를 통해 스토어의 상태를 조회하고, useDispatch로 액션을 발송하여 상태를 변경할 수 있음.

#### 핵심 개념

- **useDispatch**: useDispatch는 React 컴포넌트 내에서 Redux 스토어의 dispatch 함수를 사용할 수 있게 해주는 훅. 이 dispatch 함수를 통해 액션을 스토어에 전달하며, 이는 스토어의 상태를 변경하는 유일한 방법. 액션은 보통 { type: 'ACTION_TYPE', ...payload }의 형태로 정의됨.
- **useSelector**: useSelector는 Redux 스토어의 상태를 조회할 수 있는 훅. 이 훅을 사용하여 스토어의 특정 부분의 상태를 선택(select)하고, 그 상태를 컴포넌트에서 사용할 수 있음. useSelector는 주어진 선택 함수에 의해 반환된 값이 변경될 때마다 컴포넌트를 리렌더링함.
- **useStore**: useStore는 컴포넌트 내에서 Redux 스토어 자체에 직접 접근할 수 있게 해주는 훅. 이를 통해 스토어의 dispatch 함수나 현재 상태를 조회하는 getState 함수 등 스토어의 메서드에 접근할 수 있음. 일반적으로는 useDispatch나 useSelector로 충분하지만, 특정 경우 스토어에 직접 접근해야 할 때 사용함.

#### 주요 파일

- **storeProvider.tsx**: 애플리케이션의 최상위에 Redux store를 제공. Provider 컴포넌트를 사용하여 앱의 모든 컴포넌트에서 store에 접근할 수 있도록 함.
  useRef를 사용하여 store 인스턴스를 한 번만 생성하고, 컴포넌트 리렌더링 시 재생성되지 않도록 함.
- **lib/store.ts**: Redux store를 생성하는 함수(makeStore)와 함께, store의 타입을 추론하는 유틸리티 타입(AppStore, RootState, AppDispatch)을 정의함.
  이 구조는 특히 TypeScript를 사용할 때 유용하며, 액션 디스패치와 상태 선택 시 타입 안정성을 제공함.
- **lib/hooks.ts**: Redux의 useDispatch, useSelector, useStore 훅을 앱 전반에 걸쳐 타입이 지정된 커스텀 훅으로 사용할 수 있게 함. 이는 Redux 상태 관리와 액션 디스패치에 타입 안정성을 추가함.
- **features/user/userSlice.ts**: 사용자 데이터를 관리하기 위한 slice를 정의함. 이 slice는 사용자 정보를 저장하고 업데이트하는 리듀서와 액션을 포함함.

## Tailwind CSS

- **개념**: Tailwind CSS는 유틸리티-퍼스트 방식의 CSS 프레임워크입니다. 이는 여러분이 HTML에 직접 작은 스타일링 클래스를 적용함으로써 빠르게 디자인을 구성할 수 있게 해줍니다. Tailwind는 디자인 시스템을 제공하지 않습니다; 대신, 프로젝트에 필요한 디자인을 처음부터 신속하게 만들 수 있도록 유틸리티 클래스를 제공합니다. 이는 Bootstrap과 같은 컴포넌트 기반 프레임워크와 다른 접근 방식이며, 개발자가 클래스 이름을 조합하여 원하는 디자인을 만들 수 있게 해줍니다.

- **유틸리티 클래스**
  > - **Container**: 컨테이너는 중앙 정렬 및 반응형 크기 조정을 위한 클래스.
  > - **Box Sizing**: box-border와 box-content를 사용하여 box-sizing을 제어할 수 있음.
  > - **Display**: block, hidden, flex, grid 등의 디스플레이 유형을 설정할 수 있음.
  > - **Floats**: 요소를 왼쪽 또는 오른쪽으로 띄우는 데 사용(float-right, float-left, clearfix 등).
  > - **Clear**: clear-both, clear-left, clear-right를 사용하여 float를 제어함.
  > - **Object Fit / Position**: 이미지나 비디오의 크기 및 위치를 조정함.
  > - **Overflow:** overflow-auto, overflow-hidden 등을 사용하여 컨텐츠의 오버플로우를 관리.
  > - **Position**: relative, absolute, fixed, sticky 등을 사용하여 요소의 위치를 지정함.
  > - **Spacing**: 패딩과 마진을 조절하여 요소 간의 공간을 제어함.
  > - **Sizing**: 너비와 높이를 설정함.
  > - **Vertical Alignment**: 인라인 또는 인라인-블록 요소의 수직 정렬을 조정함.

## 라이브러리

### @types/jsonwebtoken

- **개념**: 이 패키지는 jsonwebtoken 라이브러리를 TypeScript에서 사용할 때 필요한 타입 정의를 제공. jsonwebtoken은 JWT(JSON Web Tokens)를 생성하고 검증하기 위한 라이브러리. @types/jsonwebtoken는 이 라이브러리의 함수와 객체에 대한 타입 정보를 포함하고 있어 TypeScript 프로젝트에서 jsonwebtoken을 타입 안전하게 사용할 수 있게 해줌.

### @types/cookie

#### 개념

- 서버 측에서 HTTP 쿠키를 파싱하고 직렬화하기 위한 cookie 라이브러리의 타입 정의를 제공함. 이 타입 정의는 cookie 라이브러리에서 사용되는 함수와 객체의 타입 정보를 포함하고 있으며, 주로 Node.js 환경에서 쿠키를 다룰 때 사용됨.

#### httpOnly

- **httpOnly 쿠키란?**: httpOnly 쿠키는 웹 서버에 의해 설정되며, 웹 브라우저는 이 쿠키를 웹 서버로만 전송함. 즉, 웹 페이지의 JavaScript 코드를 통해서는 httpOnly 쿠키에 접근할 수 없음. 이는 쿠키의 안전성을 보장하기 위한 조치 중 하나.

- **서버 사이드에서만 조절 가능한가?**: 네, httpOnly 옵션을 가진 쿠키는 서버 사이드에서 설정하고, 일반적으로 클라이언트 사이드에서는 이러한 쿠키를 삭제하거나 변경할 수 없음. 쿠키를 삭제하거나 변경하려면 서버 사이드에서 HTTP 응답 헤더를 통해 새로운 쿠키를 클라이언트에게 전송해야 함.

- **왜 이름이 httpOnly인가?**: 이름에서 알 수 있듯이, httpOnly 옵션은 쿠키가 HTTP(S) 프로토콜을 통해서만 접근 가능함을 의미함. JavaScript와 같은 클라이언트 사이드 스크립트를 통한 접근을 금지함으로써, 쿠키를 통한 보안 위험을 줄임. 이 옵션은 쿠키가 웹 서버와 웹 브라우저 간의 HTTP 통신에만 사용되어야 함을 나타냄.

- **클라이언트 사이드에서 로그아웃 처리 방법**: httpOnly 쿠키를 사용하는 경우, 클라이언트 사이드에서 직접적으로 로그아웃을 처리할 수 없음. 대신, 로그아웃을 위한 서버 사이드 로직을 구현해야 함. 클라이언트는 로그아웃 요청을 서버로 보내고, 서버는 Set-Cookie 헤더를 사용하여 클라이언트의 쿠키를 무효화하는 응답을 보내 로그아웃을 처리함. 예를 들어, 로그아웃 API 엔드포인트에서 쿠키의 maxAge를 0으로 설정하거나 유효하지 않은 값을 가진 쿠키를 클라이언트에게 다시 전송함으로써, 쿠키를 제거할 수 있음.

### @types/js-cookie

- **개념**: js-cookie 라이브러리는 클라이언트 측에서 쿠키를 쉽게 생성, 읽기, 삭제할 수 있도록 해주는 JavaScript 라이브러리. @types/js-cookie는 js-cookie의 TypeScript 타입 정의를 제공하며, 이를 통해 TypeScript 프로젝트에서 js-cookie를 타입 안전하게 사용할 수 있음.

### jwt-decode

- **개념**: jwt-decode는 npm에서 제공하는 경량 라이브러리로, JSON Web Tokens(JWT)를 디코딩하고, 토큰 내의 페이로드 정보를 추출하기 위해 사용됨. 이 라이브러리는 서명을 검증하지 않으므로, 보안이 중요한 용도로는 사용될 수 없음. 주로 클라이언트 사이드에서 토큰의 페이로드를 읽어 사용자 정보나 토큰의 유효 기간 등을 확인하는 데 사용됨.

```javascript
import jwtDecode from "jwt-decode";

const token = "여기에.JWT.토큰";
const decoded = jwtDecode(token);

console.log(decoded);
javascript;
```

## http

### header

- **"Content-Type": "application/json"**: 이 헤더는 요청 본문이 JSON 형식임을 나타냄. 즉, 서버에게 이 요청의 본문을 JSON으로 파싱해야 함을 알려줌.
- **Accept: "application/json"**: 이 헤더는 클라이언트가 서버로부터 받고자 하는 응답의 유형을 지정함. 여기서는 JSON 형식의 응답을 선호한다고 서버에게 알려주고 있음. GitHub OAuth 끝점은 Accept 헤더를 기반으로 다른 형식(application/json, application/xml 등)으로 응답할 수 있으며, JSON 형식의 응답을 받기 위해 이 헤더를 사용함.
- **Authorization**: 클라이언트의 인증 정보를 서버에 전달하는 데 사용됨. 예를 들어, Bearer 토큰을 사용한 API 인증에 자주 사용됨.
- **User-Agent**: 클라이언트의 소프트웨어, 운영 체제 등에 대한 정보를 포함함. 서버가 클라이언트 유형에 따라 다른 응답을 제공할 수 있게 함.
- **Accept-Encoding**: 클라이언트가 이해할 수 있는 콘텐츠 인코딩 유형(예: gzip, deflate)을 명시함.

### rel 속성

- **noopener**: target="\_blank" 속성으로 새 탭에서 링크를 열 때, 새로운 페이지가 원본 페이지에 접근할 수 있는 방법(예: window.opener 객체를 통해)을 차단. 이는 보안 취약점을 줄이는 데 도움이 되며, 특히 새 탭에서 열린 페이지가 악의적인 스크립트를 실행하여 원본 페이지를 조작하는 것을 방지.
- **noreferrer**: 링크를 클릭했을 때, 이동한 페이지에 HTTP Referrer 헤더를 전송하지 않도록 함. 사용자의 프라이버시를 보호하고, 보안을 강화하는데 도움이 됨. noopener와 함께 사용하면, 브라우저가 window.opener를 사용하여 원본 페이지에 접근하는 것을 차단할 뿐만 아니라, 리퍼러 정보의 전송도 차단함.
- **alternate**: 대체 컨텐츠를 가리킴.
- **author**: 문서의 저자를 가리킴.
- **bookmark**: 영구적인 링크를 가리킴.
- **external**: 외부 링크를 가리키며, 보통 다른 도메인으로의 링크에 사용됨.
- **license**: 콘텐츠의 라이선스 정보를 가리킴.
- **next / prev**: 시퀀스 내의 다음 또는 이전 문서를 가리킴.
- **nofollow**: 검색 엔진이 이 링크를 따라가지 않도록 지정. SEO 관점에서 중요할 수 있음.
- **tag**: 문서의 태그(키워드)를 가리킴.
