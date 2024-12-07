'use client';
import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Toaster, toast } from 'sonner';
import dynamic from 'next/dynamic';
import { auth } from '../../../../../../config/firebaseconfig'; // Đảm bảo đường dẫn đúng
import { useParams, useRouter } from 'next/navigation';
import Card from 'components/card';
import Image from 'next/image';
import axios from 'axios';
import { Typography } from '@material-tailwind/react';
import Spinner from 'components/Loader/Spinner';
import { FiCameraOff } from 'react-icons/fi';
import banner from '/public/img/profile/banner.png';
import FaceId from 'components/icons/FaceId';
import NotFaceId from 'components/icons/NotFaceId';
import Button from 'components/Button/Button';
const Clock = dynamic(
  () => import('../../../../../components/admin/descriptors/Clock'),
);
function FaceRecognition() {
  const [camOn, setCamOn] = useState(false);
  const [reportOn, setReportOn] = useState(false);
  const [errMessage, setErrMessage] = useState();
  const [successMessage, setSuccessMessage] = useState();
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const { tournamentId, teamId } = useParams();
  const [teams, setTeams] = useState([]);
  const [teamNames, setTeamNames] = useState<any[]>([]);
  const [players, setPlayers] = useState([]);
  const [readyToFetch, setReadyToFetch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [labeledFaceDescriptors, setLabeledFaceDescriptors] = useState<any[]>(
    [],
  );
  const [detectionStatus, setDetectionStatus] = useState<
    'idle' | 'detecting' | 'recognized' | 'not-recognized'
  >('idle');
  const [recognizedPlayer, setRecognizedPlayer] = useState(null);
  const [previousRecognizedPlayer, setPreviousRecognizedPlayer] =
    useState(null);
  const [recognitionHistory, setRecognitionHistory] = useState<any[]>([]); // Khởi tạo với mảng rỗng
  const [recognizedPlayerIds, setRecognizedPlayerIds] = useState<string[]>([]); // Sử dụng mảng thay vì Set
  const [sessionRecognizedPlayers, setSessionRecognizedPlayers] = useState<
    string[]
  >([]);
  const [isConfirming, setIsConfirming] = useState(false); // Thêm trạng thái xác nhận
  const router = useRouter();

  // Sử dụng mảng thay vì Set
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // lấy thông tin user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        // console.log('userId ơ day:', userId);
      } else {
        // router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Theo dõi cả userId và tournamentId
  useEffect(() => {
    if (userId && tournamentId) {
      setReadyToFetch(true);
    }
  }, [userId, tournamentId]);

  // Gọi API chỉ khi cả userId và tournamentId đều sẵn sàng
  useEffect(() => {
    async function fetchTeams() {
      if (readyToFetch) {
        setLoading(true); // Đảm bảo chỉ loading khi thực sự gọi API
        try {
          const response = await axios.get('/api/teams/getTeam', {
            params: {
              userId,
              tournamentId,
            },
          });
          setTeams(response.data.teams);
          console.log('Teamstrave:', response.data.teams);
        } catch (error) {
          console.error('Không thể lấy danh sách đội:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    // lấy lịch sử nhận diện cầu thủ
    async function fetchRecognitionHistory() {
      if (readyToFetch) {
        try {
          const response = await axios.get(
            '/api/players/getrecognitionhistory',
            {
              params: {
                userId,
                tournamentId,
              },
            },
          );
          const historyData = response.data || [];
          setRecognitionHistory(historyData);
          console.log('Lịch sử nhận diện:', historyData);

          const playerIds = historyData.map((record: any) => record.playerId);
          console.log('PlayerIds:', playerIds);
          setRecognizedPlayerIds(playerIds);
        } catch (error) {
          console.error('Không thể lấy lịch sử nhận diện:', error);
        }
      }
    }

    if (readyToFetch) {
      fetchTeams();
      fetchRecognitionHistory();
    }
  }, [readyToFetch, userId, tournamentId]);

  useEffect(() => {
    console.log('Recognition HistoryID:', recognizedPlayerIds);
  }, [recognizedPlayerIds]);

  // Load models khi userId thay đổi
  useEffect(() => {
    if (userId) {
      const loadModels = async () => {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);

        const labeledFaceDescriptors = await loadLabeledFaceDescriptors(
          userId,
          tournamentId as string,
        );
        if (labeledFaceDescriptors.length > 0) {
          const faceDescriptors = labeledFaceDescriptors.map(
            (desc) => desc.labeledFaceDescriptor,
          );
          setFaceMatcher(new faceapi.FaceMatcher(faceDescriptors, 0.5)); // Khởi tạo một instance của FaceMatcher với các face descriptors đã được gắn nhãn (labeled) và thiết lập ngưỡng tương đồng (0.5).
        } else {
          console.error('Không tìm thấy face descriptors');
          toast.error('Không tìm thấy face descriptors');
        }
        setModelsLoaded(true);
        console.log('Face matcher:', faceMatcher);
      };
      loadModels();
    }
  }, [userId, tournamentId]);

  // lấy thông tin cầu thủ từ API
  const loadLabeledFaceDescriptors = async (
    userId: string,
    tournamentId: string,
  ) => {
    try {
      console.log('Loading labeled face descriptors...', userId, tournamentId);
      const response = await axios.get('/api/players/allPlayers', {
        params: {
          userId,
          tournamentId,
        },
      });

      const players = response.data.players;
      console.log('Players:', players);
      const labeledFaceDescriptors = players
        .map((player: any) => {
          if (!player.faceDescriptor) {
            console.warn(
              `Player ${player.playerName} does not have faceDescriptor`,
            );
            return null;
          }
          const descriptors = player.faceDescriptor.map(
            (desc: string) => new Float32Array(JSON.parse(desc)),
          );
          console.log('descriptors0:', descriptors);
          const label = player.playerName
            ? String(player.playerName)
            : 'Unknown';

          console.log('Playerdescriptors:', descriptors);
          return {
            labeledFaceDescriptor: new faceapi.LabeledFaceDescriptors(
              label,
              descriptors,
            ),
            playerInfo: {
              playerName: player.playerName,
              avatarUrl: player.avatarUrl,
              teamId: player.teamId,
              playerId: player.playerId,
              displayName: player.displayName,
              jerseyNumber: player.jerseyNumber,
            },
          };
        })
        .filter(Boolean);
      console.log('Labeled face descriptors:', labeledFaceDescriptors);

      setLabeledFaceDescriptors(labeledFaceDescriptors); // Set state here

      return labeledFaceDescriptors;
    } catch (error) {
      console.error('Error loading labeled face descriptors:', error);
      toast.error('Vui lòng thêm cầu thủ vào hệ thống');
      router.push(`/admin/tournament/${tournamentId}/team`);
      return [];
    }
  };

  // phần nhận dạng gương mặt và vẽ lên m
  const detectFace = () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const webcam = webcamRef.current; // tham chiếu đến webcam
    const canvas = canvasRef.current; // tham chiếu đến canvas

    // Lấy Các Tham Chiếu và Thiết Lập Vòng Lặp Phát Hiện Khuôn Mặt
    const id = setInterval(async () => {
      setDetectionStatus('detecting');

      const detections = await faceapi // Phát hiện khuôn mặt
        .detectSingleFace(
          webcam,
          new faceapi.TinyFaceDetectorOptions({
            // Sử dụng mô hình nhận diện khuôn mặt nhỏ
            inputSize: 160, // Kích thước đầu vào cho mô hình phát hiện khuôn mặt (160x160).
            scoreThreshold: 0.5, // Ngưỡng xác suất để xác định một phát hiện có hợp lệ hay không (0.5).
          }),
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor();

      // Xử Lý Sau Khi Phát Hiện Khuôn Mặt
      if (detections) {
        console.log('Detections:', detections);
        const resizedDetections = faceapi.resizeResults(detections, {
          width: webcam.offsetWidth,
          height: webcam.offsetHeight,
        });
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          if (faceMatcher && detections.descriptor) {
            console.log('Face matcher1:', detections.descriptor);

            const bestMatch = faceMatcher?.findBestMatch(
              detections?.descriptor,
            ); // So sánh descriptor của khuôn mặt được phát hiện với các labeledFaceDescriptors để tìm kết quả phù hợp nhất.
            // so gương mặt mới với các gương mặt đã được gắn nhãn
            const text = bestMatch.toString();
            const anchor = {
              x: resizedDetections.detection.box.x,
              y: resizedDetections.detection.box.y,
            };
            const drawOptions: faceapi.draw.DrawTextFieldOptions = {
              anchorPosition: 'BOTTOM_LEFT' as faceapi.draw.AnchorPosition,
              backgroundColor: 'rgba(0, 0, 219)',
              fontColor: 'white',
              fontSize: 14,
              fontStyle: 'Arial',
              padding: 2,
            };
            const drawBox = new faceapi.draw.DrawTextField(
              text,
              anchor,
              drawOptions,
            );
            drawBox.draw(canvas);

            // Nhận Diện Người Dùng
            const recognizedPlayerInfo = labeledFaceDescriptors.find(
              (desc) => desc.labeledFaceDescriptor.label === bestMatch.label,
            )?.playerInfo;

            if (recognizedPlayerInfo) {
              setRecognizedPlayer(recognizedPlayerInfo); // tìm thông tin cầu thủ từ labeledFaceDescriptors
              setDetectionStatus('recognized'); // Đặt trạng thái nhận diện
              // Chỉ gọi API khi nhận diện được cầu thủ mới
              const isInHistory = recognizedPlayerIds.includes(
                recognizedPlayerInfo.playerId,
              );
              console.log('Is in history:', recognizedPlayerIds);
              const isInSession = sessionRecognizedPlayers.includes(
                recognizedPlayerInfo.playerId,
              );
              console.log('Is in session:', sessionRecognizedPlayers);

              if (!isInHistory && !isInSession) {
                await axios.post('/api/players/recognitionhistory', {
                  userId: userId,
                  teamId: recognizedPlayerInfo.teamId,
                  playerId: recognizedPlayerInfo.playerId,
                  timestamp: new Date().toISOString(),
                  tournamentId,
                  status: 'recognized',
                });

                setSessionRecognizedPlayers((prev) => [
                  ...prev,
                  recognizedPlayerInfo.playerId,
                ]);

                setPreviousRecognizedPlayer(recognizedPlayerInfo);
              }
              setIsConfirming(true); // Đặt trạng thái xác nhận
              clearInterval(id); // Tạm dừng quá trình nhận diện
            } else {
              setDetectionStatus('not-recognized');
              setIsConfirming(true); // Đặt trạng thái xác nhận
              clearInterval(id); // Tạm dừng quá trình nhận diện
            }
          } else {
            setDetectionStatus('not-recognized');
            setIsConfirming(true); // Đặt trạng thái xác nhận
            clearInterval(id); // Tạm dừng quá trình nhận diện
          }
        }
      } else {
        setDetectionStatus('not-recognized');
        setIsConfirming(true); // Đặt trạng thái xác nhận
        clearInterval(id); // Tạm dừng quá trình nhận diện
      }
    }, 100); // Thiết lập một vòng lặp chạy mỗi 100ms để liên tục phát hiện khuôn mặt từ luồng video.
    setIntervalId(id); //
  };

  // bắt đầu và kết thúc nhận diện
  const handleOn = async () => {
    if (modelsLoaded) {
      setCamOn(true);
      startVideo();
      setDetectionStatus('detecting');
    } else {
      toast.error('Models are still loading. Please wait.');
    }
  };
  // kết thúc nhận diện
  const handleOff = async () => {
    setCamOn(false);
    stopVideo();
    setDetectionStatus('idle');
    setRecognizedPlayer(null);
    setIsConfirming(false); // Reset trạng thái xác nhận
  };
  // xác nhận cầu thủ
  const handleConfirm = () => {
    setRecognizedPlayer(null);
    setDetectionStatus('idle');
    setIsConfirming(false);
    detectFace(); // Bắt đầu lại quá trình nhận diện
  };
  // bắt đầu video
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        detectFace();
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      toast.error('Cannot access webcam');
    }
  };
  // kết thúc video
  const stopVideo = () => {
    clearInterval(intervalId);
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      webcamRef.current.srcObject = null;
    }
    setDetectionStatus('idle');
    setRecognizedPlayer(null);
    setIsConfirming(false); // Reset trạng thái xác nhận
  };

  // lấy thông tin đội bóng từ API
  useEffect(() => {
    const teamNameMapping = teams.reduce((acc, team) => {
      acc[team.id] = team.teamName;
      console.log('Team:', acc);
      return acc;
    }, {} as { [key: string]: string });
    setTeamNames(teamNameMapping);
    console.log('Team names:', teamNameMapping);
  }, [teams]);

  const teamName = teamNames[recognizedPlayer?.teamId] || 'Unknown Team';
  const isConfirmed = recognizedPlayerIds.includes(
    recognizedPlayer?.playerId || '',
  );

  if (loading || !modelsLoaded) {
    return <Spinner />;
  }

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      {/* Phần Camera */}
      <div className="gird flex  w-full flex-col p-4 md:w-1/2">
        <div
          className={`relative flex w-full items-start justify-center border-4 ${
            camOn
              ? detectionStatus === 'recognized'
                ? 'border-green-500'
                : detectionStatus === 'not-recognized'
                ? 'border-red-500'
                : 'border-gray-500'
              : 'border-gray-500'
          }`}
          style={{ height: '50%', width: '100%' }}
        >
          {!!camOn ? (
            <div className="h-full w-full flex-1 items-center justify-center">
              <video
                crossOrigin="anonymous"
                ref={webcamRef}
                autoPlay
                className="h-full w-full object-cover"
                style={{ height: '100%', width: '100%' }}
              ></video>
              <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10"
                width="480"
                height="480"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center"></div>
          )}
        </div>
        <button
          type="button"
          className={`${
            camOn
              ? 'w-full bg-gray-500'
              : 'mt-2 w-full items-center rounded bg-blue-500 px-4 py-2 pl-10 pr-10 font-bold text-white hover:bg-blue-700'
          } ${
            camOn ? 'hover:bg-blue-700' : 'hover:bg-gray-700'
          } mt-2 items-center rounded px-4 py-2 font-bold text-white`}
          onClick={camOn ? handleOff : handleOn}
        >
          {`${camOn ? 'Kết thúc' : 'Bắt đầu'}`} nhận diện
        </button>
      </div>

      {/* Phần Hiển Thị Thông Tin */}
      <div className="flex w-full flex-col p-4 md:w-1/2">
        {camOn ? (
          <div className="card bg-base-300 rounded-box grid h-20 flex-grow ">
            {detectionStatus === 'detecting' ? (
              <Spinner />
            ) : (
              <>
                {recognizedPlayer ? (
                  <Card
                    key={recognizedPlayer?.teamId}
                    extra={'items-center h-1/2 w-full  p-[16px]'}
                  >
                    {/* Nội dung khi nhận diện được cầu thủ */}
                    <div
                      className="relative mt-1 flex h-32 w-full justify-center rounded-md bg-cover"
                      style={{ backgroundImage: `url(${banner.src})` }}
                    >
                      <div className="absolute -bottom-20 flex h-[164px] w-[164px] items-center justify-center rounded-md border-[4px] border-white bg-pink-400 dark:!border-navy-700">
                        <Image
                          width="2"
                          height="20"
                          className="h-full w-full rounded-md"
                          src={recognizedPlayer?.avatarUrl}
                          alt={recognizedPlayer?.playerName}
                        />
                      </div>
                    </div>

                    {/* Thông tin khác */}
                    <div className="mt-20 flex gap-4 md:!gap-14">
                      <div className="mt-30 flex flex-col items-center">
                        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                          {recognizedPlayer.playerName}
                        </h4>
                        <h5 className="text-base font-normal text-gray-600">
                          Tên thi đấu: {recognizedPlayer.displayName}
                        </h5>
                        <h5 className="text-base font-normal text-gray-600">
                          Số áo thi đấu:{recognizedPlayer.jerseyNumber}
                        </h5>
                        <h5 className="text-base font-normal text-gray-600">
                          Đội thi đấu:{teamName}
                        </h5>
                        Tình trạng xác nhận:{' '}
                        {isConfirmed ? 'đã xác nhận' : 'chưa xác nhận'}
                      </div>
                    </div>

                    {isConfirming && (
                      <Button
                        className="mt-4 w-full bg-navy-700 text-white"
                        onClick={handleConfirm}
                      >
                        Xác nhận cầu thủ
                      </Button>
                    )}
                  </Card>
                ) : (
                  <Card
                    key={recognizedPlayer?.teamId}
                    extra={'items-center h-1/2 w-full p-[16px]'}
                  >
                    <NotFaceId />
                    <h5 className="text-base font-normal text-gray-600">
                      Không tìm thấy thông tin cầu thủ vui lòng thử lại!
                    </h5>{' '}
                    <Button
                      className="mt-4 w-full bg-navy-700 text-white"
                      onClick={handleConfirm}
                    >
                      Xác nhận lại cầu thủ
                    </Button>
                  </Card>
                )}
              </>
            )}
          </div>
        ) : (
          <Card
            key={recognizedPlayer?.teamId}
            extra={'items-center h-1/2 w-full p-[16px]'}
          >
            <FaceId />
          </Card>
        )}
      </div>
    </div>
  );
}

export default FaceRecognition;
