import React from 'react';
import {shallow} from 'enzyme';
import MultiSelectAutoComplete from '../../src/helpers/MultiSelectAutoComplete';


describe('>>>MULTISELECT_AUTOCOMPLETE --- Shallow Render REACT COMPONENTS',()=>{
    let wrapper;

    beforeEach(()=>{
      wrapper = shallow(<MultiSelectAutoComplete updateSelectedItems={()=>{}} selectedItems={[]}/>)
    })

    it('+++ render the DUMB component', () => {
       expect(wrapper.length).toEqual(1)
    });
     
    
});
