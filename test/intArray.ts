(() => {
    // Int8Array -> Int32Array로 변환
    const int8Array = new Int8Array([1, 2, 3, 4, 5, 6, 7, 8]); // 예시 데이터
    console.log("Original Int8Array:", int8Array); // 처음 Int8Array 출력
  
    const int32Array = new Int32Array(int8Array.buffer); // buffer를 공유하여 Int32Array로 변환
    console.log("Converted to Int32Array:", int32Array); // Int32Array 출력
  
    const int8ArrayAgain = new Int8Array(int32Array.buffer); // Int32Array의 buffer를 다시 Int8Array로 변환
    console.log("Converted back to Int8Array:", int8ArrayAgain); // 다시 Int8Array 출력
  })();