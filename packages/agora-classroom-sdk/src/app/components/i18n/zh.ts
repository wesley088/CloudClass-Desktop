import { ErrorCodeMessage, ErrorCode } from '@/app/utils/error';

export default {
  home_product_name: '灵动课堂',
  home_greeting: '欢迎使用灵动课堂',
  home_form_field_room: '房间名',
  home_form_field_name: '用户名',
  home_form_field_role: '角色',
  home_form_field_type: '房间类型',
  home_form_field_duration: '时长',
  home_form_submit: '进入房间',
  home_form_placeholder_room_name: '请输入房间名称',
  home_form_placeholder_user_name: '请输入用户名',
  home_form_placeholder_user_role: '请选择角色',
  home_form_placeholder_room_type: '请选择教室类型',
  home_form_error_room_name_empty: '房间名不能为空',
  home_form_error_user_name_empty: '用户名不能为空',
  home_form_error_role_type_empty: '角色类型不能为空',
  home_form_error_room_type_empty: '房间类型不能为空',
  home_form_error_room_name_limit: '房间名为{min}-{max}位字符',
  home_form_error_user_name_limit: '用户名为{min}-{max}位字符',
  // 补充
  [ErrorCodeMessage[ErrorCode.COURSE_HAS_ENDED]]: '当前课堂直播已经结束',
  fcr_home_label_room_list_no_more: '已经到底了 🤐',
  fcr_logout_tips: '用户账号过期,稍后请重新登录',
  fcr_menu_sign_out: '登出',
  fcr_join_room_tips_ui_config_note_ready: 'UI 配置没准备好',
  fcr_join_room_tips_user_id_empty: '用户ID不能为空',
  fcr_create_tips_time_validate: '选择时间必须大于当前时间',
  fcr_create_tips_room_name: '请输入房间名称',
  fcr_create_more_settings_expand: '展开',
  fcr_create_room_current_time: '当前时间',
  fcr_create_tips_room_playback_link: '请输入你的录像地址',
  fcr_create_label_latency_type: '服务类型',
  fcr_create_room_tips_name_rule: '请输入字母，数字，汉字或者下划线',
  fcr_joinroom_option_audience: '助教',
  fcr_joinroom_label_role: '角色',
  fcr_joinroom_tips_room_id_empty: '房间ID不能为空且必须为数字',
  fcr_join_room_tips_room_id_invalid: '无效的房间ID',
  fcr_join_room_tips_room_id: '请输入房间ID',
  fcr_join_room_button_join: '加入房间',
  fcr_join_room_tips_room_is_ended: '当前房间直播已经结束',
  fcr_share_tips_copy_all_fault: '房间信息复制失败',
  fcr_share_tips_copy_id_fault: '房间ID复制失败',
  fcr_share_tips_copy_all_success: '房间信息已经复制到剪贴',
  fcr_share_tips_copy_id_success: '房间ID已经复制到剪贴',
  fcr_api_tips_fetch_room_info_fault: '获取房间信息失败,请刷新页面或稍后重新尝试',
  fcr_h5_invite_hello: '您好!',
  // 2.8.0分割线
  fcr_create_label_room_name_empty: '房间名不能为空',
  fcr_share_label_copy_invitation: '你可以复制课堂邀请并发送给参加者',
  fcr_create_tips_starttime: '课堂开始时间必须早于当前时间 ',
  fcr_industry_option_education: '教育',
  fcr_industry_option_entertainment: '娱乐',
  fcr_home_label_slogan: '轻松创建线上专属课堂',
  fcr_home_label_welcome_message: '欢迎使用灵动课堂',
  fcr_home_label_logo: '灵动课堂',
  fcr_home_label_roomlist: '房间列表',
  fcr_home_label_small_classroom: '小班课',
  fcr_home_label_lecture_hall: '大班课',
  fcr_home_label_1on1: '1对1 ',
  fcr_home_button_create: '创建课堂',
  fcr_home_button_join: '加入房间',
  fcr_home_button_enter: '进入房间',
  fcr_home_button_replay: '回放',
  fcr_home_status_upcoming: '待开始',
  fcr_home_status_live: '进行中',
  fcr_home_status_over: '已结束',
  fcr_home_form_time: '2022-08-12,12:00-16:00',
  fcr_create_label_create_classroom: '创建房间',
  fcr_create_label_room_name: '房间名称',
  fcr_create_label_room_name_default: '{name}的房间',
  fcr_create_label_starttime: '开始时间',
  fcr_create_label_endtime: '结束时间',
  fcr_create_label_classmode: '教学模式',
  fcr_create_label_moresettings: '更多设置',
  fcr_create_label_security: '安全防护',
  fcr_create_label_1on1_description: '适合1对1教学场景，老师和学生可以在课堂中自由的互动交流',
  fcr_create_label_smallclassroom_description:
    '适合人数较少的互动教学场景，老师和学生可以自由的在台上交流',
  fcr_create_label_lecturehall_description:
    '适合人数较多的单向教学场景，学员视频交流前需要进行上台申请 ',
  fcr_create_label_servicetype_RTC: '无延迟-实时互动（RTC）',
  fcr_create_label_servicetype_Standard: '轻延迟-极速直播',
  fcr_create_label_servicetype_CDN: '标准延迟-CDN',
  fcr_create_label_latency_RTC: '延迟约400毫秒',
  fcr_create_label_latency_Standard: '延迟约1秒',
  fcr_create_label_latency_CDN: '延迟约6秒',
  fcr_create_label_watermark: '水印',
  fcr_create_label_playback: '录像直播',
  fcr_create_label_playback_description: '使用录像回放作为直播视频源',
  fcr_create_label_playback_link: '录像地址',
  fcr_create_label_defaulttime: '默认30分钟',
  fcr_h5create_label_small_classroom: '小班课堂',
  fcr_h5create_label_lecture_hall: '大班课堂',
  fcr_h5create_label_1on1: '1对1课堂',
  fcr_h5create_label_interactive: '实时互动',
  fcr_h5create_label_broadcast: '单向直播',
  fcr_create_tips_roomid: '输入房间名称',
  fcr_create_tips_create_success: '您已成功创建一个课堂',
  fcr_create_tips_create_failed: '创建课堂失败',
  fcr_create_tips_playback_link: '请输入录像地址',
  fcr_create_tips_playback_createfail: '必须输入录像地址才可创建录像直播课',
  fcr_create_option_timeselector_Mon: '周一',
  fcr_create_option_timeselector_Tue: '周二',
  fcr_create_option_timeselector_Wed: '周三',
  fcr_create_option_timeselector_Thu: '周四',
  fcr_create_option_timeselector_Fri: '周五',
  fcr_create_option_timeselector_Sat: '周六',
  fcr_create_option_timeselector_Sun: '周日',
  fcr_create_button_create: '创建',
  fcr_create_button_cancel: '取消',
  fcr_share_label_room_id: '房间号',
  fcr_share_label_invitation:
    '邀请人 邀请你加入课堂课堂名称课堂时间： 开始时间--结束时间点击链接加入课堂：URL或复制课堂ID加入课堂 ： 课堂ID',
  fcr_share_button_: '复制全部',
  fcr_create_button_: '仅复制房间链接与房间ID',
  fcr_inshare_label_room_name: 'xxx的课堂',
  fcr_inshare_label_room_id: '房间ID',
  fcr_inshare_button_share: '分享',
  fcr_joinroom_label_join: '加入房间',
  fcr_joinroom_label_RoomID: '房间号',
  fcr_joinroom_label_name: '昵称',
  fcr_joinroom_option_teacher: '老师',
  fcr_joinroom_option_student: '学生',
  fcr_joinroom_button_confirm: '确认',
  fcr_joinroom_button_cancel: '取消',
  fcr_joinroom_tips_name: '请输入昵称',
  fcr_joinroom_tips_emptyid: '房间号不存在',
  fcr_joinroom_tips_smallclassroom: 'h5暂不支持小班课',
  fcr_joinroom_tips_1on1: 'h5暂不支持1对1',
  fcr_join_room_tips_class_mode: 'H5仅支持大班课',
  fcr_joinroom_tips_role: 'H5仅支持学生角色',
  fcr_sharelink_label_welcome: '欢迎使用灵动课堂！',
  fcr_sharelink_label_slogon: '灵动课堂',
  fcr_sharelink_label_invitation: '邀请你加入',
  fcr_sharelink_form_time: '13:10-13:40 2022-02-02   2022-02-02',
  fcr_sharelink_tips_roomid: '房间ID已经复制到剪贴板',
  fcr_sharelink_tips_classmode: 'H5仅支持大班课',
  fcr_sharelink_tips_roleteacher: 'H5仅支持老师角色',
  fcr_sharelink_tips_name: '请输入昵称',
};
