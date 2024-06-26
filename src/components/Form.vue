<!--
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-09-26 15:10
 * @LastAuthor : itchaox
 * @LastTime   : 2024-06-26 09:47
 * @desc       : 
-->
<script setup>
  import { ref, onMounted } from 'vue';
  import { bitable, FieldType, DateFormatter } from '@lark-base-open/js-sdk';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import find from '../utils';

  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const base = bitable.base;

  const fieldOptions = ref();
  const fieldId = ref();

  let dateFormatList = [
    {
      name: 't1',
      value: '无',
    },
    {
      name: 't2',
      value: '-',
    },
    {
      name: 't3',
      value: '_',
    },
    {
      name: 't4',
      value: '/',
    },
  ];
  let dateFormat = ref();

  const loading = ref(false);

  onMounted(async () => {
    const table = await base.getActiveTable();
    const view = await table.getActiveView();
    const tableMetaList = await view.getFieldMetaList();
    fieldOptions.value = tableMetaList.map((item) => ({ value: item.id, label: item.name }));
  });

  async function confirm() {
    if (!fieldId.value) {
      ElMessage({
        type: 'error',
        message: t('Please select the mobile phone number column'),
      });
      return;
    }

    if (!dateFormat.value) {
      ElMessage({
        type: 'error',
        message: t('Please select the location format of your mobile phone number'),
      });
      return;
    }

    if (!operatorId.value) {
      ElMessage({
        type: 'error',
        message: t('Please select the operator column'),
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

      const area = find(val[0]?.text || val);

      let format = !['无', 'none', 'なし'].includes(dateFormat.value) ? dateFormat.value : '';

      // 根据手机号码获取手机号码所属地
      _list.push({
        recordId: recordIds[index],
        fields: {
          [field.id]: area.province ? area.province + format + area.city : `【${t('Wrong format of phone number')}】`,
          [operatorId.value]: area.op !== '异常' ? area.op : `【${t('Wrong format of phone number')}】`,
        },
      });
    }

    await table.setRecords(_list);

    loading.value = false;
    ElMessage({
      message: t('Data processing completed'),
      type: 'success',
    });
  }

  const operatorId = ref();
</script>

<template>
  <div
    v-loading="loading"
    :element-loading-text="$t('loading')"
  >
    <div class="line">
      <div class="title">{{ $t('Mobile phone number column') }}</div>
      <div>
        <el-select
          filterable
          v-model="fieldId"
          :placeholder="$t('Please select the mobile phone number column')"
          size="large"
          clearable
        >
          <el-option
            v-for="item in fieldOptions?.filter((item) => item.value !== areaId && item.value !== operatorId)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>

    <div class="line">
      <div class="title top">{{ $t('Belonging to the region') }}</div>
      <div>
        <el-select
          filterable
          v-model="areaId"
          :placeholder="$t('Please select your location')"
          size="large"
          clearable
        >
          <el-option
            v-for="item in fieldOptions?.filter((item) => item.value !== fieldId && item.value !== operatorId)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>

    <div class="line">
      <div class="title top">{{ $t('Domicile format') }}</div>
      <div>
        <el-select
          v-model="dateFormat"
          :placeholder="$t('Please select the location format')"
          size="large"
          clearable
        >
          <el-option
            v-for="item in dateFormatList"
            :key="item.value"
            :label="$t(item.name)"
            :value="$t(item.value)"
          />
        </el-select>
      </div>
    </div>

    <div class="line">
      <div class="title top">{{ $t('Operator') }}</div>
      <div>
        <el-select
          filterable
          v-model="operatorId"
          :placeholder="$t('Please select the operator column')"
          size="large"
          clearable
        >
          <el-option
            v-for="item in fieldOptions?.filter((item) => item.value !== fieldId && item.value !== areaId)"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </div>

    <el-button
      type="primary"
      class="btn"
      @click="confirm"
    >
      <el-icon size="22"><CaretRight /></el-icon>
      {{ $t('run') }}</el-button
    >
  </div>
</template>

<style scoped>
  .line {
    display: flex;
    align-items: center;
    margin-bottom: 14px;
  }

  .title {
    font-size: 16px;
    /* font-weight: 700; */
    margin-right: 5px;
    width: 85px;
  }

  .top {
  }

  .btn {
    margin-top: 20px;
  }
</style>
