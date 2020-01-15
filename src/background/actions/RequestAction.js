class RequestAction {
  handle({ url }) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);

      xhr.onload = error => {
        resolve({
          responseText: xhr.responseText
        });
      };

      xhr.onerror = event => {
        reject(Error('Request error'))
      };

      xhr.send();
    });
  }
}

export default RequestAction;
