<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-09-26 15:10
 * @LastAuthor : itchaox
 * @LastTime   : 2024-04-11 00:35
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
      name: '格式: 广东深圳',
      value: '无',
    },
    {
      name: '格式: 广东-深圳',
      value: '-',
    },
    {
      name: '格式: 广东_深圳',
      value: '_',
    },
    {
      name: '格式: 广东/深圳',
      value: '/',
    },
  ];
  let dateFormat = ref();

  const loading = ref(false);

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

    generateBirthdayRow();
  }

  // 所属地列
  const areaId = ref();

  /**
   * @desc  : 生成手机号码所属地列
   */
  async function generateBirthdayRow() {
    loading.value = true;

    const table = await base.getActiveTable();
    const recordList = await table.getRecordList();
    const field = await table.getField(areaId.value); // 选择某个多行文本字段
    const recordIds = await table.getRecordIdList(); // 获取所有记录 id

    let _list = [];
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
      _list.push({
        recordId: recordIds[index],
        fields: {
          [field.id]: area.province ? area.province + format + area.city : '【手机号码格式错误】',
        },
      });
    }

    await table.setRecords(_list);

    loading.value = false;
    ElMessage({
      message: '数据处理完成',
      type: 'success',
    });
  }
</script>

<template>
  <div
    v-loading="loading"
    element-loading-text="加载中..."
  >
    <div class="title">手机号码列</div>
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

    <div class="title top">所属地列</div>
    <div>
      <el-select
        v-model="areaId"
        placeholder="请选择所属地列"
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

    <div class="title top">所属地格式</div>
    <div>
      <el-select
        v-model="dateFormat"
        placeholder="请选择所属地格式"
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
    >
      <el-icon size="22"><CaretRight /></el-icon>
      运行</el-button
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
