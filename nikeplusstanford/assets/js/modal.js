function Modal(params) {
	this.modal = params.modal;
	this.initModal();
}

Modal.prototype = {
	initModal: function() {
		this.modalHeader = this.modal.find('.modal-header h3');
		this.modalBody = this.modal.find('.modal-body');
		this.modalFooter = this.modal.find('.modal-footer');
	},

	showModal: function(headerText, bodyText, includeFooter) {
		this.modalHeader.html(headerText);
		this.modalBody.html(bodyText);

		//defaults to true
		if (typeof(includeFooter) === 'undefined' || includeFooter) {
			if (!this.modalFooter.length) {
				this.modalBody.after(
					'<div class="modal-footer">\
	        			<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>\
	     			 </div>'
				)
				this.modalFooter = this.modal.find('.modal-footer');
			}
		} else if (!includeFooter) {
			this.modalFooter.remove();
		}

		//show modal
		this.modal.modal();
	},

}