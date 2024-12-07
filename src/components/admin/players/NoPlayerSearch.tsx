import Image from 'next/image';

export default function NoPlayerSearch() {
  return (
    <div className="flex flex-col items-center gap-[23px]">
      <Image
        src="/nodata.png"
        alt="No Players Info"
        width={242}
        height={200}
        className="mt-[70px] md:mt-[154px] lg:mt-[72px]"
        priority
      />
      <h2 className="text-heading-mc text-lg font-bold">Chưa có dữ liệu</h2>
      <p className="text-body-variant text-gray-medium dark:text-gray-light text-center">
        Không tìm thấy cầu thủ
        <br />
        <span className="font-bold">Thêm cầu thủ</span>
      </p>
    </div>
  );
}
