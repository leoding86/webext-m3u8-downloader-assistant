import MgtvAdapter from '@/content_scripts/adapters/mgtv';
import IqiyiAdapter from '@/content_scripts/adapters/iqiyi';

class AdapterFactory {
  static instance;

  static getAdatper(data) {
    return AdapterFactory.getDefault().getAdatperFromData(data);
  }

  static getDefault() {
    if (!AdapterFactory.instance) {
      AdapterFactory.instance = new AdapterFactory();
    }

    return AdapterFactory.instance;
  }

  getAdatperFromData(data) {
    if (data.source.match(/^https?:\/{2}([^/?]+\.)*mgtv\.com/)) {
      return MgtvAdapter.getDefault({data});
    } else if (data.source.match(/^https?:\/{2}([^/?]+\.)*iqiyi\.com/)) {
      return IqiyiAdapter.getDefault({data});
    } else {
      throw Error('Cannot get data adapter');
    }
  }
}

export default AdapterFactory;
