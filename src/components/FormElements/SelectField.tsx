'use client';

import { useState } from 'react';
import { PaymentTerms } from '../../lib/types';

export default function SelectField({
  value,
  onChange,
}: {
  value: PaymentTerms;
  onChange: (value: PaymentTerms) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<PaymentTerms>(
    value || PaymentTerms.Net30Days,
  );

  const handleTermSelect = (term: PaymentTerms) => {
    setSelectedTerm(term);
    setIsOpen(false);
    onChange(term);
  };

  const paymentTermsOptions: PaymentTerms[] = [
    PaymentTerms.Net1Day,
    PaymentTerms.Net7Days,
    PaymentTerms.Net14Days,
    PaymentTerms.Net30Days,
  ];

  return (
    <div className="relative mb-[25px]">
      <h4 className="text-body-variant text-blue-gray mb-2 block">
        Payment Terms
      </h4>
      <div
        className="text-heading-s-variant border-gray-light focus:ring-primary focus:border-primary hover:border-primary dark:bg-dark-light relative h-12 w-full rounded 
        border bg-white p-4 pr-8 hover:cursor-pointer 
        focus:outline-none dark:border-[#252945]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {`Net ${selectedTerm} ${selectedTerm === 1 ? 'Day' : 'Days'}`}

        <div className="pointer-events-none absolute inset-y-0 right-0 mr-1.5 flex rotate-0 items-center px-2">
          <span
            className={`transition duration-200 ease-in-out ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          ></span>
        </div>
      </div>

      {isOpen && (
        <div className="shadow-filter-light divide-gray-light dark:bg-dark-medium dark:shadow-filter-dark dark:divide-dark-light absolute left-0 top-full z-10 mt-2 w-full divide-y-[1px] rounded-lg bg-white">
          {paymentTermsOptions.map((term) => (
            <div
              key={term}
              onClick={() => handleTermSelect(term)}
              className="text-heading-s-variant hover:text-primary cursor-pointer py-4 ps-6 transition duration-200 ease-in-out"
            >
              {`Net ${term} ${term === 1 ? 'Day' : 'Days'}`}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
