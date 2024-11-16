import React, { useState, useRef, useEffect } from 'react';
import {
  Input,
  List,
  ListItem,
  ListItemPrefix,
  Typography,
} from '@material-tailwind/react';
import debounce from 'lodash.debounce';
import { CiLocationOn } from 'react-icons/ci';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search?';

interface SearchBoxProps {
  values: string;
  setSelectPosition: React.Dispatch<any>;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  setSelectPosition,
  setFieldValue,
  values,
}) => {
  console.log('values', values);
  const [searchText, setSearchText] = useState(values);
  const [listPlace, setListPlace] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = debounce((query: string) => {
    const params = {
      q: query,
      format: 'json',
      addressdetails: '1', // Chuyển đổi thành chuỗi
      polygon_geojson: '0', // Chuyển đổi thành chuỗi
    };
    const queryString = new URLSearchParams(params).toString();
    const requestOptions: RequestInit = {
      method: 'GET',
      redirect: 'follow' as RequestRedirect, // Sử dụng kiểu đúng cho thuộc tính redirect
    };
    fetch(`${NOMINATIM_BASE_URL}${queryString}`, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(JSON.parse(result));
        setListPlace(JSON.parse(result));
        setIsVisible(true);
      })
      .catch((err) => console.log('err: ', err));
  }, 300); // Thêm khoảng thời gian trễ 300ms

  useEffect(() => {
    if (isVisible && resultsRef.current) {
      resultsRef.current.focus();
    }
  }, [isVisible]);

  useEffect(() => {
    if (searchText.length > 2) {
      handleSearch(searchText);
    } else {
      setIsVisible(false);
    }
  }, [searchText]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Input
            label="Địa điểm tổ chức"
            style={{ width: '100%' }}
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
            }}
          />
        </div>
      </div>
      {isVisible && (
        <div
          className="search-results"
          aria-live="polite"
          tabIndex={-1}
          ref={resultsRef}
        >
          <List>
            {listPlace.map((item) => (
              <div key={item?.place_id}>
                <ListItem
                  onClick={() => {
                    setSelectPosition(item);
                    setFieldValue('location', item.display_name);
                    setSearchText(item.display_name); // Cập nhật giá trị của ô nhập
                    setIsVisible(false);
                  }}
                >
                  <ListItemPrefix>
                    <CiLocationOn className="flex items-center text-brand-500 dark:text-white" />
                  </ListItemPrefix>
                  <Typography>{item?.display_name}</Typography>
                </ListItem>
                {/* Thay thế Divider bằng hr */}
              </div>
            ))}
          </List>
        </div>
      )}
    </div>
  );
};

export default SearchBox;
