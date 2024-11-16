import React, { useEffect, useRef } from 'react';
import { useJsApiLoader, Libraries } from '@react-google-maps/api';

const libraries: Libraries = ['places'];

const MapAutocompleteComponent = ({ onPlaceSelected }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyBXnCTwIk36PWUdnGI0LIakL8SNvoPhWl0', // Thay thế bằng API key của bạn
    libraries,
  });

  const inputRef = useRef(null);
  const autocomplete = useRef(null);

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      autocomplete.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['(cities)'], // Thay đổi loại địa điểm nếu cần
        },
      );

      autocomplete.current.addListener('place_changed', () => {
        const place = autocomplete.current.getPlace();
        onPlaceSelected(place);
      });
    }
  }, [isLoaded]);

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Enter a location"
      style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
    />
  );
};

export default MapAutocompleteComponent;
