import { storage } from '@/infra/utils';
import { RtmRole, RtmTokenBuilder } from 'agora-access-token';
import { EduRoleTypeEnum, EduRoomServiceTypeEnum, EduRoomTypeEnum, Platform } from 'agora-edu-core';
import {
  AgoraLatencyLevel,
  AgoraRegion,
  AgoraRteEngineConfig,
  AgoraRteRuntimePlatform,
} from 'agora-rte-sdk';
import { useCallback, useContext } from 'react';
import { useHistory } from 'react-router';
import { aMessage, useI18n } from '~ui-kit';
import { GlobalStoreContext, RoomStoreContext, UserStoreContext } from '../stores';
import { GlobalLaunchOption } from '../stores/global';
import { ShareLink } from '../utils';
import { checkBrowserDevice } from '../utils/browser';
import {
  REACT_APP_AGORA_APP_CERTIFICATE,
  REACT_APP_AGORA_APP_ID,
  REACT_APP_AGORA_APP_SDK_DOMAIN,
} from '../utils/env';
import { useBuilderConfig } from './useBuildConfig';
import { useCheckRoomInfo } from './useCheckRoomInfo';

type JoinRoomParams = {
  role: EduRoleTypeEnum;
  roomType: EduRoomTypeEnum;
  roomServiceType: EduRoomServiceTypeEnum;
  roomName: string;
  userName: string;
  roomId: string;
  userId: string;
  duration?: number;
  token: string;
  appId: string;
  platform?: Platform;
};
type QuickJoinRoomParams = {
  role: EduRoleTypeEnum;
  roomId: string;
  nickName?: string;
  platform?: Platform;
};

type JoinRoomOptions = Pick<GlobalLaunchOption, 'shareUrl' | 'uiMode'> & {
  roomProperties?: Record<string, any>;
};

export const webRTCCodecH264 = [
  EduRoomServiceTypeEnum.CDN,
  EduRoomServiceTypeEnum.Fusion,
  EduRoomServiceTypeEnum.MixStreamCDN,
  EduRoomServiceTypeEnum.HostingScene,
];

// 1. 伪直播场景不需要pretest
// 2. 合流转推场景下的学生角色不需要pretest
export const needPreset = (
  roomType: EduRoomTypeEnum,
  roomServiceType: EduRoomServiceTypeEnum,
  roleType: EduRoleTypeEnum,
) => {
  if (roomType !== EduRoomTypeEnum.RoomBigClass) {
    return true;
  }

  if (roomServiceType === EduRoomServiceTypeEnum.HostingScene) {
    return false;
  }

  if (
    roomServiceType === EduRoomServiceTypeEnum.MixStreamCDN &&
    roleType !== EduRoleTypeEnum.teacher
  ) {
    return false;
  }
  return true;
};

type ShareURLParams = {
  region: AgoraRegion;
  roomId: string;
  owner: string;
};

const shareLinkInClass = ({ region, roomId, owner }: ShareURLParams) => {
  if (AgoraRteEngineConfig.platform === AgoraRteRuntimePlatform.Electron) {
    return '';
  }
  const companyId = window.__launchCompanyId;
  const projectId = window.__launchProjectId;
  let url = ShareLink.instance.generateUrl({
    owner,
    roomId: roomId,
    region: region,
  });
  if (companyId && projectId) {
    url = url + `&companyId=${companyId}&projectId=${projectId}`;
  }
  return url;
};

const defaultPlatform = checkBrowserDevice();
export const useJoinRoom = () => {
  const history = useHistory();
  const transI18n = useI18n();
  const userStore = useContext(UserStoreContext);
  const roomStore = useContext(RoomStoreContext);
  const { language, region, setLaunchConfig } = useContext(GlobalStoreContext);
  const { builderResource, configReady } = useBuilderConfig();
  const { checkRoomInfoBeforeJoin, h5ClassModeIsSupport } = useCheckRoomInfo();

  const joinRoomHandle = useCallback(
    async (params: JoinRoomParams, options: JoinRoomOptions = {}) => {
      const {
        role,
        roomType,
        roomName,
        userName,
        roomId,
        userId,
        roomServiceType,
        token,
        appId,
        duration = 30,
        platform = defaultPlatform,
      } = params;
      try {
        if (platform === Platform.H5 && !h5ClassModeIsSupport(roomType)) {
          return;
        }
        if (!configReady) {
          aMessage.error('fcr_join_room_tips_ui_config_note_ready');
          return;
        }

        if (!userId) {
          aMessage.error('fcr_join_room_tips_user_id_empty');
          return;
        }

        const courseWareList = storage.getCourseWareSaveList();

        const shareUrl = shareLinkInClass({ region, roomId, owner: userStore.nickName });

        console.log('## get rtm Token from demo server', token);

        const isLivePremium =
          roomType === EduRoomTypeEnum.RoomBigClass &&
          roomServiceType === EduRoomServiceTypeEnum.LivePremium;

        const latencyLevel = isLivePremium ? AgoraLatencyLevel.UltraLow : AgoraLatencyLevel.Low;

        const needPretest = needPreset(roomType, roomServiceType, role);
        const webRTCCodec = webRTCCodecH264.includes(roomServiceType) ? 'h264' : 'vp8';
        const config: GlobalLaunchOption = {
          appId: REACT_APP_AGORA_APP_ID || appId,
          sdkDomain: `${REACT_APP_AGORA_APP_SDK_DOMAIN}`,
          pretest: needPretest,
          courseWareList: courseWareList.slice(0, 1),
          language: language,
          userUuid: userId,
          rtmToken: token,
          roomUuid: roomId,
          roomType: roomType,
          roomName: `${roomName}`,
          roomServiceType,
          userName: userName,
          roleType: role,
          region: region,
          duration: +duration * 60,
          latencyLevel,
          userFlexProperties: options.roomProperties || {},
          scenes: builderResource.current.scenes,
          themes: builderResource.current.themes,
          shareUrl,
          platform,
          mediaOptions: {
            web: {
              codec: webRTCCodec,
            },
          },
        };
        // this is for DEBUG PURPOSE only. please do not store certificate in client, it's not safe.
        // 此处仅为开发调试使用, token应该通过服务端生成, 请确保不要把证书保存在客户端
        if (REACT_APP_AGORA_APP_CERTIFICATE) {
          config.rtmToken = RtmTokenBuilder.buildToken(
            config.appId,
            REACT_APP_AGORA_APP_CERTIFICATE,
            config.userUuid,
            RtmRole.Rtm_User,
            0,
          );
          console.log(`## build rtm Token ${config.rtmToken} by using RtmTokenBuilder`);
        }
        setLaunchConfig(config);
        history.push('/launch');
      } catch (e) {
        aMessage.error(
          (e as Error).message === 'Network Error'
            ? transI18n('home.network_error')
            : (e as Error).message,
          2.5,
        );
      }
    },
    [language, region, setLaunchConfig, history, configReady],
  );

  const quickJoinRoom = useCallback(
    async (params: QuickJoinRoomParams) => {
      const { roomId, role, nickName, platform = defaultPlatform } = params;
      return roomStore.joinRoom(roomId, role).then((response) => {
        const { roomDetail, token, appId } = response.data.data;
        const { serviceType, ...rProps } = roomDetail.roomProperties;
        if (!checkRoomInfoBeforeJoin(roomDetail)) {
          return;
        }
        return joinRoomHandle(
          {
            roomId: roomDetail.roomId,
            roomName: roomDetail.roomName,
            roomType: roomDetail.roomType,
            roomServiceType: serviceType,
            userId: userStore.userInfo?.companyId || '',
            userName: nickName || userStore.nickName,
            role,
            token,
            appId,
            platform,
          },
          { roomProperties: rProps },
        );
      });
    },
    [joinRoomHandle, checkRoomInfoBeforeJoin],
  );
  return {
    joinRoomHandle,
    quickJoinRoom,
    configReady,
  };
};
