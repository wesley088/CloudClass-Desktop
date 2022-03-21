import { AgoraRteEventType, AgoraRteScene, AgoraUser } from 'agora-rte-sdk';
import { observable, action, computed } from 'mobx';
import { EduStoreBase } from '../base';
import { EduUser } from './struct';
import { EduClassroomConfig, EduEventCenter } from '../../../..';
import { AgoraEduClassroomEvent, EduRoleTypeEnum } from '../../../../type';
import { AGEduErrorCode, EduErrorCenter } from '../../../../utils/error';
import { RteRole2EduRole } from '../../../../utils';
import { FetchUserParam } from './type';
import { BatchRecord } from '../../../../utils/batch';

export class UserStore extends EduStoreBase {
  @observable
  private _dataStore: DataStore = {
    users: new Map(),
    teacherList: new Map(),
    studentList: new Map(),
    assistantList: new Map(),
    rewards: new Map(),
    localUser: undefined,
  };

  @computed
  get localUser() {
    return this._dataStore.localUser;
  }

  @computed
  get users(): Map<string, EduUser> {
    return this._dataStore.users;
  }

  @computed
  get teacherList(): Map<string, EduUser> {
    return this._dataStore.teacherList;
  }

  @computed
  get studentList(): Map<string, EduUser> {
    return this._dataStore.studentList;
  }

  @computed
  get assistantList(): Map<string, EduUser> {
    return this._dataStore.assistantList;
  }

  @computed
  get rewards(): Map<string, number> {
    return this._dataStore.rewards;
  }

  async fetchUserList(params: FetchUserParam) {
    try {
      const data = await this.classroomStore.api.fetchUserList(
        this.classroomStore.connectionStore.sceneId,
        {
          ...params,
        },
      );
      return {
        total: data.total,
        count: data.count,
        nextId: data.nextId,
        list: data.list,
      };
    } catch (error) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_FETCH_USER_LIST,
        error as Error,
      );
    }
  }

  @action.bound
  async kickOutOnceOrBan(userUuid: string, isBan: boolean) {
    try {
      await this.classroomStore.api.kickOutOnceOrBan(
        userUuid,
        isBan,
        this.classroomStore.connectionStore.sceneId,
      );
    } catch (error) {
      return EduErrorCenter.shared.handleThrowableError(
        AGEduErrorCode.EDU_ERR_KICK_OUT_FAIL,
        error as Error,
      );
    }
  }

  @action
  private _setEventHandler(scene: AgoraRteScene) {
    const handler = SceneEventHandler.createEventHandler(scene);
    this._dataStore = handler.dataStore;
  }

  onInstall() {
    computed(() => this.classroomStore.connectionStore.scene).observe(({ newValue, oldValue }) => {
      if (newValue) {
        this._setEventHandler(newValue);
      }
    });

    computed(() => this.rewards).observe(({ newValue, oldValue }) => {
      let changedUserUuids: string[] = [];
      for (const [userUuid] of newValue) {
        let previousReward = 0;
        if (oldValue) {
          previousReward = oldValue.get(userUuid) || 0;
        }
        let reward = newValue.get(userUuid) || 0;
        if (reward > previousReward) {
          changedUserUuids.push(userUuid);
        }
      }
      if (changedUserUuids.length > 0) {
        const userNames = changedUserUuids.map(
          (userUuid) => this.studentList.get(userUuid)?.userName,
        );
        EduEventCenter.shared.emitClasroomEvents(
          AgoraEduClassroomEvent.RewardReceived,
          userNames.join(','),
        );
      }
    });
  }
  onDestroy() {
    SceneEventHandler.cleanup();
  }
}

type DataStore = {
  users: Map<string, EduUser>;
  teacherList: Map<string, EduUser>;
  studentList: Map<string, EduUser>;
  assistantList: Map<string, EduUser>;
  rewards: Map<string, number>;
  localUser?: EduUser;
};

class SceneEventHandler {
  private static _handlers: Record<string, SceneEventHandler> = {};

  static createEventHandler(scene: AgoraRteScene) {
    if (!SceneEventHandler._handlers[scene.sceneId]) {
      const handler = new SceneEventHandler(scene);

      handler.addEventHandlers();

      SceneEventHandler._handlers[scene.sceneId] = handler;
    }
    return SceneEventHandler._handlers[scene.sceneId];
  }

  static cleanup() {
    Object.keys(SceneEventHandler._handlers).forEach((k) => {
      SceneEventHandler._handlers[k].removeEventHandlers();
    });

    SceneEventHandler._handlers = {};
  }

  constructor(private _scene: AgoraRteScene) {}

  @observable
  dataStore: DataStore = {
    users: new Map(),
    teacherList: new Map(),
    studentList: new Map(),
    assistantList: new Map(),
    rewards: new Map(),
    localUser: undefined,
  };

  addEventHandlers() {
    this._scene.on(AgoraRteEventType.UserAdded, this._addUsers);
    this._scene.on(AgoraRteEventType.UserRemoved, this._removeUsers);
    this._scene.on(AgoraRteEventType.UserUpdated, this._updateUsers);
    this._scene.on(AgoraRteEventType.UserPropertyUpdated, this._updateUserProperties);
    this._scene.on(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
    this._scene.on(AgoraRteEventType.BatchUserPropertyUpdated, this._updateBatchUserProperties);
  }

  removeEventHandlers() {
    this._scene.off(AgoraRteEventType.UserAdded, this._addUsers);
    this._scene.off(AgoraRteEventType.UserRemoved, this._removeUsers);
    this._scene.off(AgoraRteEventType.UserUpdated, this._updateUsers);
    this._scene.off(AgoraRteEventType.UserPropertyUpdated, this._updateUserProperties);
    this._scene.off(AgoraRteEventType.RoomPropertyUpdated, this._handleRoomPropertiesChange);
    this._scene.off(AgoraRteEventType.BatchUserPropertyUpdated, this._updateBatchUserProperties);
  }

  @action.bound
  private _handleRoomPropertiesChange(changedRoomProperties: string[], roomProperties: any) {
    if (changedRoomProperties.includes('students')) {
      this.dataStore.rewards = new Map(
        Object.entries(roomProperties['students']).map(([userUuid, { reward }]: any) => {
          return [userUuid, reward];
        }),
      );
    }
  }

  @action.bound
  private _addUsers(users: AgoraUser[]) {
    const { sessionInfo } = EduClassroomConfig.shared;
    const newRewards = new Map(this.dataStore.rewards);
    users.forEach((user) => {
      let userItem = new EduUser(user);
      if (userItem.userUuid === sessionInfo.userUuid) {
        this.dataStore.localUser = userItem;
      }
      if (userItem.userRole === EduRoleTypeEnum.teacher) {
        this.dataStore.teacherList.set(user.userUuid, userItem);
      }
      if (userItem.userRole === EduRoleTypeEnum.student) {
        this.dataStore.studentList.set(user.userUuid, userItem);
      }
      if (userItem.userRole === EduRoleTypeEnum.assistant) {
        this.dataStore.assistantList.set(user.userUuid, userItem);
      }
      this.dataStore.users.set(user.userUuid, userItem);
      // initialize reward count when one comes in
      const reward = user.userProperties.get('reward');
      if (reward) {
        newRewards.set(user.userUuid, reward.count || 0);
      }
    });
    this.dataStore.rewards = newRewards;
  }

  @action.bound
  private _removeUsers(users: AgoraUser[], type: number) {
    const { sessionInfo } = EduClassroomConfig.shared;

    users.forEach((user) => {
      // 2 means user has been kicked out
      if (type === 2) {
        EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.KickOut, user);
      }

      const userRole = RteRole2EduRole(sessionInfo.roomType, user.userRole);

      if (user.userUuid === sessionInfo.userUuid) {
        this.dataStore.localUser = undefined;
      }
      if (userRole === EduRoleTypeEnum.teacher) {
        this.dataStore.teacherList.delete(user.userUuid);
      }
      if (userRole === EduRoleTypeEnum.student) {
        this.dataStore.studentList.delete(user.userUuid);
      }
      if (userRole === EduRoleTypeEnum.assistant) {
        this.dataStore.assistantList.delete(user.userUuid);
      }
      this.dataStore.users.delete(user.userUuid);
    });
  }

  @action.bound
  private _updateUsers(users: AgoraUser[]) {
    const { sessionInfo } = EduClassroomConfig.shared;

    users.forEach((user) => {
      let userItem = new EduUser(user);
      if (userItem.userUuid === sessionInfo.userUuid) {
        this.dataStore.localUser = userItem;
      }
      if (userItem.userRole === EduRoleTypeEnum.teacher) {
        this.dataStore.teacherList.set(user.userUuid, userItem);
      }
      if (userItem.userRole === EduRoleTypeEnum.student) {
        this.dataStore.studentList.set(user.userUuid, userItem);
      }
      if (userItem.userRole === EduRoleTypeEnum.assistant) {
        this.dataStore.assistantList.set(user.userUuid, userItem);
      }
      this.dataStore.users.set(user.userUuid, userItem);
    });
  }

  @action.bound
  private _updateUserProperties(userUuid: string, userProperties: any, operator: any, cause: any) {
    const { reward } = userProperties;
    if (reward) {
      const newRewards = new Map(this.dataStore.rewards);
      newRewards.set(userUuid, reward.count || 0);
      this._updateRewards(newRewards, false);
    }
  }

  @action.bound
  async _updateRewards(newRewards: Map<string, number>, isBatch: boolean) {
    const oldRewards = this.dataStore.rewards;
    this.dataStore.rewards = newRewards;
    if (isBatch) {
      const userNames = this._getRewardedUsers(oldRewards, newRewards);

      if (userNames.length) {
        EduEventCenter.shared.emitClasroomEvents(
          AgoraEduClassroomEvent.BatchRewardReceived,
          userNames,
        );
      }
    } else {
      const userNames = this._getRewardedUsers(oldRewards, newRewards);

      if (userNames.length) {
        EduEventCenter.shared.emitClasroomEvents(AgoraEduClassroomEvent.RewardReceived, userNames);
      }
    }
  }

  private _updateBatchUserProperties(
    users: { userUuid: string; userName: string; userProperties: any }[],
    operator: any,
    cause: any,
  ) {
    const batchRecord = BatchRecord.getBatchRecord<typeof users>(cause.data, (batchArray) => {
      const allUsers = batchArray.flat();
      const newRewards = new Map(this.dataStore.rewards);
      for (const user of allUsers) {
        const { userUuid, userProperties } = user;

        const { reward } = userProperties;

        if (reward) {
          newRewards.set(userUuid, reward.count || 0);
        }
      }

      this._updateRewards(newRewards, true);
    });

    batchRecord.addBatch(users);
  }

  private _getRewardedUsers(oldRewards: Map<string, number>, newRewards: Map<string, number>) {
    let changedUserUuids: string[] = [];
    for (const [userUuid] of newRewards) {
      let previousReward = 0;
      if (oldRewards) {
        previousReward = oldRewards.get(userUuid) || 0;
      }
      let reward = newRewards.get(userUuid) || 0;
      if (reward > previousReward) {
        changedUserUuids.push(userUuid);
      }
    }

    if (changedUserUuids.length > 0) {
      const userNames = changedUserUuids.map(
        (userUuid) => this.dataStore.studentList.get(userUuid)?.userName,
      );
      return userNames;
    }

    return [];
  }
}
