<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-09-26 15:10
 * @LastAuthor : itchaox
 * @LastTime   : 2023-11-18 16:39
 * @desc       : 
-->
<script setup>
  import { ref, onMounted } from 'vue';
  import { bitable, FieldType, DateFormatter } from '@lark-base-open/js-sdk';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import find from '../utils';

  const base = bitable.base;

  const fieldOptions = ref();
  const fieldId = ref();

  let dateFormatList = [
    {
      name: '格式: 湖南长沙',
      value: '无',
    },
    {
      name: '格式: 湖南-长沙',
      value: '-',
    },
    {
      name: '格式: 湖南_长沙',
      value: '_',
    },
    {
      name: '格式: 湖南/长沙',
      value: '/',
    },
  ];
  let dateFormat = ref();

  onMounted(async () => {
    const table = await base.getActiveTable();
    const tableMetaList = await table.getFieldMetaList();
    fieldOptions.value = tableMetaList.map((item) => ({ value: item.id, label: item.name }));
  });

  async function confirm() {
    if (!fieldId.value) {
      ElMessage({
        type: 'error',
        message: '请选择手机号码列!',
      });
      return;
    }

    if (!dateFormat.value) {
      ElMessage({
        type: 'error',
        message: '请选择手机号码所属地格式!',
      });
      return;
    }

    const table = await base.getActiveTable();
    // 无手机号码所属地列表则创建, 有则提醒会覆盖数据
    const fieldMetaList = await table.getFieldMetaList();
    const hasBirthday = fieldMetaList.find((item) => item.name === '手机号码所属地');

    if (!hasBirthday) {
      await table.addField({ type: FieldType.DateTime, name: '手机号码所属地' });
      generateBirthdayRow();
    } else {
      ElMessageBox.confirm('已存在(手机号码所属地列) ,后续操作会覆盖前面手机号码所属地列数据,请确认是否继续?', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        ElMessage({
          type: 'success',
          message: '开始生成数据...',
        });
        generateBirthdayRow();
      });
    }
  }

  /**
   * @desc  : 生成手机号码所属地列
   */
  async function generateBirthdayRow() {
    const table = await base.getActiveTable();
    const recordList = await table.getRecordList();
    const field = await table.getField('手机号码所属地'); // 选择某个多行文本字段
    const recordIds = await table.getRecordIdList(); // 获取所有记录 id

    for (const record of recordList) {
      const id = record.id;
      // 获取索引
      const index = recordList.recordIdList.findIndex((iId) => iId === id);
      const cell = await record.getCellByField(fieldId.value);
      const val = await cell.val;
      if (!val) continue;

      const area = find(val[0]?.text);
      let format = dateFormat.value !== '无' ? dateFormat.value : '';

      // 根据手机号码获取手机号码所属地
      await table.setCellValue(
        field.id,
        recordIds[index],
        area.province ? area.province + format + area.city : '【手机号码格式错误】',
      );
    }

    ElMessage({
      message: '数据生成结束!',
      type: 'success',
    });
  }
</script>

<template>
  <div>
    <div class="title">请选择手机号码列</div>
    <div>
      <el-select
        v-model="fieldId"
        placeholder="请选择手机号码列"
        size="large"
      >
        <el-option
          v-for="item in fieldOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <div class="title top">请选择手机号码所属地格式</div>
    <div>
      <el-select
        v-model="dateFormat"
        placeholder="请选择手机号码所属地格式"
        size="large"
      >
        <el-option
          v-for="item in dateFormatList"
          :key="item.value"
          :label="item.name"
          :value="item.value"
        />
      </el-select>
    </div>

    <el-button
      type="primary"
      class="btn"
      @click="confirm"
      >请确认</el-button
    >
  </div>
</template>

<style scoped>
  .title {
    font-size: 16px;
    font-weight: 700;
    color: rgb(31, 35, 41);
    margin-bottom: 14px;
  }

  .top {
    margin-top: 20px;
  }

  .btn {
    margin-top: 20px;
  }
</style>
