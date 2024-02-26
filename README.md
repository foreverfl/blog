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

## TypeScript

- **개념**: 타입스크립트는 자바스크립트(JavaScript)에 타입(type)을 추가한 언어. 자바스크립트는 동적 타입 언어로서, 변수의 타입이 실행 시점에 결정되며, 변경될 수 있음. 반면, 타입스크립트는 정적 타입 언어의 특성을 추가하여, 개발 시점에 변수의 타입을 지정해줌으로써 보다 안정적인 코드를 작성할 수 있도록 도움. 타입스크립트는 결국 자바스크립트로 컴파일되어 실행되므로, 모든 자바스크립트 코드는 유효한 타입스크립트 코드가 될 수 있음. 타입스크립트는 대규모 애플리케이션 개발에 적합하며, 개발자들이 더욱 안정적이고 관리하기 쉬운 코드를 작성할 수 있도록 도와줌.

- **특징**
  > - **타입 주석(Type Annotations)**: 변수나 함수의 반환 값에 타입을 명시적으로 선언함. 이를 통해 컴파일 시 타입 체크를 할 수 있어, 오류를 미리 방지할 수 있음.

```javascript
let message: string = "Hello, TypeScript";
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

> - **인터페이스(Interfaces)**: 객체의 형태를 정의할 수 있는 방법으로, 타입 체킹을 위해 사용됨. 인터페이스를 통해 객체가 특정 구조를 충족하도록 강제할 수 있음.

```javascript
interface User {
  name: string;
  age: number;
}

function registerUser(user: User) {
  // ...
}
```

> - **제네릭(Generics)**: 타입을 매개변수로 받아서 사용할 수 있는 기능으로, 다양한 타입에 대해 호환성을 유지하면서 코드를 재사용할 수 있게 함.

```javascript
function identity<T>(arg: T): T {
  return arg;
}
```

> - **유니언 타입(Union Types)과 인터섹션 타입(Intersection Types)**: 유니언 타입은 변수가 여러 타입 중 하나일 수 있음을 의미하고, 인터섹션 타입은 여러 타입을 모두 만족하는 타입을 의미함.

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

- **js와의 차이점**

  > - **타입 시스템**: JS는 동적 타입 언어이고, TS는 정적 타입 언어. TS는 컴파일 시점에 타입 체크를 수행하여 오류를 사전에 발견할 수 있음.
  > - **개발 도구 지원**: TS는 코드를 작성하는 도중에도 에러를 감지하고 자동 완성, 인터페이스 및 타입 정보 제공 등 향상된 개발 경험을 제공함.
  > - **호환성**: TS는 JS의 상위 집합이므로, 모든 JS 코드는 TS에서도 작동합니다. TS를 사용하면 JS로 컴파일하여 실행할 수 있음.

- **사용 이유**
  > - **오류 감소**: 컴파일 시점에 타입 체크를 수행하여 런타임 오류를 줄일 수 있음.
  > - **코드 가독성 및 유지보수**: 프로젝트가 커질수록 타입 정보가 코드의 가독성과 유지보수성을 높여줌.
  > - **팀 개발**: 큰 규모의 프로젝트나 팀에서 작업할 때, 타입스크립트의 엄격한 타입 시스템은 개발자 간의 명확한 커뮤니케이션을 도와주고, 실수를 줄여줌.

## Pages Router vs App Router

- **pages 디렉토리 (Pages Router)**: 전통적인 Next.js 라우팅 방식을 사용. 파일 시스템 기반 라우팅을 제공하며, pages 디렉토리 내의 파일 구조가 URL 경로와 직접 매핑됨.
  예를 들어, pages/about.tsx 파일은 /about URL로 접근할 수 있는 페이지를 생성함. 각 페이지는 자체적으로 라우트 및 로직을 포함하고, 자동으로 코드 분할 및 서버 사이드 렌더링(SSR) 또는 정적 사이트 생성(SSG)을 지원함.

- **app 디렉토리 (App Router)**: Next.js 13 이상에서 도입된 새로운 라우팅 및 페이지 구성 방식. app 디렉토리는 더 세밀한 컨트롤을 위한 라우트 핸들링, 레이아웃, 공통 페이지 요소의 재사용성을 높이기 위해 설계됨. app 내에서는 페이지 구성 요소(layouts, error pages 등)를 포함하여 애플리케이션의 전반적인 구조를 정의할 수 있음. 파일 시스템 기반 라우팅 뿐만 아니라, 라우트 경로를 더 명확하게 커스터마이즈할 수 있으며, 페이지 간 상태 공유, 레이아웃 내에서 페이지 전환 제어 등 고급 기능을 사용할 수 있음.

## API Router 구성 방식

- **페이지 (Pages)**: pages 디렉토리 내의 파일들은 Next.js의 라우팅 시스템에 의해 자동으로 라우트로 변환됨. 예를 들어, pages/about.js 파일은 /about URL로 접근할 수 있는 페이지를 생성함. 이 페이지들은 서버 사이드 렌더링(SSR), 정적 사이트 생성(SSG), 클라이언트 사이드 렌더링(CSR) 등 다양한 렌더링 방식을 지원함.

- **API 라우트**: pages/api 디렉토리 내의 파일들은 API 엔드포인트로 작동함. 이는 서버리스 함수(serverless functions)로 배포되며, 주로 데이터를 조회하거나 수정하는 데 사용됨. 예를 들어, pages/api/hello.js 파일은 /api/hello URL로 접근할 수 있는 API 엔드포인트를 생성하며, 주로 JSON 형태의 데이터를 반환함.

## Next.js에서 링크 및 API 요청 처리하기

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

## Redux in Next.js

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
