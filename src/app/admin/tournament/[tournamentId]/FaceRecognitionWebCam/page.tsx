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
  >([]); // Sử dụng mảng thay vì Set
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        console.log('userId ơ day:', userId);
      } else {
        // router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Theo dõi cả userId và tournamentId để xác định khi nào sẵn sàng gọi API
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
          setFaceMatcher(new faceapi.FaceMatcher(faceDescriptors, 0.5)); // số 0.5 là ngưỡng để xác định face số càng nhỏ thì càng chính xác
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
            },
          };
        })
        .filter(Boolean);
      console.log('Labeled face descriptors:', labeledFaceDescriptors);

      setLabeledFaceDescriptors(labeledFaceDescriptors); // Set state here

      return labeledFaceDescriptors;
    } catch (error) {
      console.error('Error loading labeled face descriptors:', error);
      toast.error('Failed to load face descriptors');
      return [];
    }
  };

  //phần nhận dạng gương mặt và vẽ lên m
  const detectFace = () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const webcam = webcamRef.current;
    const canvas = canvasRef.current;

    const id = setInterval(async () => {
      setDetectionStatus('detecting');
      const detections = await faceapi
        .detectSingleFace(
          webcam,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 160,
            scoreThreshold: 0.5,
          }),
        )
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor();
      console.log('Detections:', detections);

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
            );
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

            // Find the recognized player information
            const recognizedPlayerInfo = labeledFaceDescriptors.find(
              (desc) => desc.labeledFaceDescriptor.label === bestMatch.label,
            )?.playerInfo;

            if (recognizedPlayerInfo) {
              setRecognizedPlayer(recognizedPlayerInfo);
              setDetectionStatus('recognized');

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
            } else {
              setDetectionStatus('not-recognized');
            }
          } else {
            setDetectionStatus('not-recognized');
          }
        }
      } else {
        setDetectionStatus('not-recognized');
      }
    }, 100);
    setIntervalId(id);
  };

  const handleOn = async () => {
    if (modelsLoaded) {
      setCamOn(true);
      startVideo();
      setDetectionStatus('detecting');
    } else {
      toast.error('Models are still loading. Please wait.');
    }
  };

  const handleOff = async () => {
    setCamOn(false);
    stopVideo();
    setDetectionStatus('idle');
  };

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240 },
    });
    if (webcamRef.current) {
      webcamRef.current.srcObject = stream;
      detectFace();
    }
  };

  const stopVideo = () => {
    clearInterval(intervalId);
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      webcamRef.current.srcObject = null;
    }
  };

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

  if (loading || !modelsLoaded) {
    return <Spinner />;
  }

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      <div className="flex w-full flex-col p-4 md:w-1/2">
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
            <div className="flex h-full w-full items-center justify-center">
              <FiCameraOff className="text-9xl text-gray-500" />
            </div>
          )}
        </div>
        <button
          type="button"
          className={`${
            camOn
              ? ' w-full bg-gray-500 '
              : 'mt-2  w-full items-center rounded bg-blue-500 px-4 py-2 pl-10 pr-10 font-bold text-white hover:bg-blue-700'
          } ${
            camOn ? 'hover:bg-blue-700' : 'hover:bg-gray-700'
          } mt-2 items-center rounded px-4 py-2 font-bold text-white`}
          onClick={camOn ? handleOff : handleOn}
        >
          {`${camOn ? 'Kết thúc' : 'Bắt đầu'}`} nhận diện
        </button>
      </div>

      <div className="flex w-full flex-col p-4 md:w-1/2">
        {camOn && (
          <div className="card bg-base-300 rounded-box grid h-20 flex-grow ">
            {detectionStatus === 'detecting' ? (
              <Spinner />
            ) : recognizedPlayer ? (
              <Card
                key={recognizedPlayer?.teamId}
                extra={'items-center w-full  p-[16px]'}
              >
                {/* Background and profile */}
                <div
                  className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
                  style={{ backgroundImage: `url(${banner.src})` }}
                >
                  <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
                    <Image
                      width="2"
                      height="20"
                      className="h-full w-full rounded-full"
                      src={recognizedPlayer?.avatarUrl}
                      alt={recognizedPlayer?.playerName}
                    />
                  </div>
                </div>

                {/* Name and position */}
                <div className="mt-16 flex flex-col items-center">
                  <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                    {recognizedPlayer.playerName}
                  </h4>
                  <h5 className="text-base font-normal text-gray-600">
                    {teamName}
                  </h5>
                </div>

                {/* Post followers */}
                <div className="mb-3 mt-6 flex gap-4 md:!gap-14">
                  <div className="flex flex-col items-center justify-center">
                    <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                      17
                    </h4>
                    <p className="text-sm font-normal text-gray-600">Posts</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                      9.7K
                    </h4>
                    <p className="text-sm font-normal text-gray-600">
                      Followers
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                      434
                    </h4>
                    <p className="text-sm font-normal text-gray-600">
                      Following
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <p className="text-lg font-bold">Không nhận diện được cầu thủ</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FaceRecognition;
