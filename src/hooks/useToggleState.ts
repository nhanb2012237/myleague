/*
File useToggleState.ts 
định nghĩa một custom hook trong React, được gọi là useToggleState. 
Hook này cung cấp một cách dễ dàng để quản lý trạng thái boolean (true/false) và một hàm để chuyển đổi trạng thái đó.

Cụ thể:

useToggleState nhận vào một giá trị khởi tạo (initialState), mặc định là false.
Nó sử dụng hook useState của React để tạo ra một state và một hàm cập nhật state.
Hàm toggleState được định nghĩa để chuyển đổi giá trị của state giữa true và false.
Cuối cùng, hook trả về một đối tượng chứa state hiện tại và hàm toggleState.
*/

import { useState } from 'react';

export const useToggleState = (initialState = false) => {
  const [state, setState] = useState(initialState);

  const toggleState = () => setState((prevState) => !prevState);

  return { state, toggleState };
};
